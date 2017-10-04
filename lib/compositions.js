'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.andThen = andThen;
exports.optional = optional;
exports.nullable = nullable;
exports.decodeArray = decodeArray;
exports.decodeTuple2 = decodeTuple2;
exports.decodeObject = decodeObject;
exports.decodeMap = decodeMap;
exports.decodeField = decodeField;
exports.oneOf = oneOf;
exports.oneOf3 = oneOf3;
exports.oneOf4 = oneOf4;

var _asserts = require('./asserts');

var _primitives = require('./primitives');

/**
 * Will verify that the passed-in arbitrary object indeed is an Array,
 * and return it.  Otherwise throws a runtime error.
 */


/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Decoder of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
function asArray(blobs) {
    if (!Array.isArray(blobs)) {
        throw (0, _asserts.DecodeError)('Not an array', 'Expected an array', blobs);
    }

    return blobs;
}

/**
 * Will verify that the passed-in arbitrary object indeed is an Object,
 * and return it.  Otherwise throws a runtime error.
 */
function asObject(blob) {
    if ((typeof blob === 'undefined' ? 'undefined' : _typeof(blob)) !== 'object') {
        throw (0, _asserts.DecodeError)('Not an object', 'Expected an object', blob);
    }

    return blob;
}

/**
 * Create a decoder that, when decoding A works, will allow you to generate a decoder B on
 * the fly, based on the parsed-out value of A, then continue feeding that decoder the
 * original blob.
 */
function andThen(decoderFactory, decoder) {
    return function (blob) {
        var valueA = decoder(blob);
        var decoderB = decoderFactory(valueA);
        return decoderB(blob);
    };
}

/**
 * Will wrap the given decoder, making it accept undefined, too.
 */
function optional(decoder) {
    var allowNull = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (allowNull) {
        return oneOf3(decoder, (0, _primitives.decodeUndefined)(), andThen(function () {
            return (0, _primitives.decodeValue)(undefined);
        }, (0, _primitives.decodeNull)()));
    } else {
        return oneOf(decoder, (0, _primitives.decodeUndefined)());
    }
}

/**
 * Will wrap the given decoder, making it accept null values, too.
 */
function nullable(decoder) {
    return oneOf(decoder, (0, _primitives.decodeNull)());
}

/**
 * Decodes an Array<T> from the given input, given a decoder for type T.
 */
function decodeArray(itemDecoder) {
    return function (blobs) {
        blobs = asArray(blobs);
        return blobs.map(function (blob, index) {
            try {
                return itemDecoder(blob);
            } catch (e) {
                if ('blob' in e) {
                    throw (0, _asserts.DecodeError)('Unexpected value at index ' + index, 'See below.', blob, [e]);
                } else {
                    throw e;
                }
            }
        });
    };
}

/**
 * Decodes a 2-tuple of [T, V] from the given input, given decoders for type T and V.
 */
function decodeTuple2(decoderT, decoderV) {
    return function (blobs) {
        blobs = asArray(blobs);
        if (blobs.length !== 2) {
            throw (0, _asserts.DecodeError)('Not a 2-tuple', 'Expected a 2-tuple, but got an array of ' + blobs.length + ' elements', blobs);
        }

        var _blobs = blobs,
            _blobs2 = _slicedToArray(_blobs, 2),
            blob0 = _blobs2[0],
            blob1 = _blobs2[1];

        var t0 = void 0,
            t1 = void 0;

        try {
            t0 = decoderT(blob0);
        } catch (e) {
            if ('blob' in e) {
                throw (0, _asserts.DecodeError)('Unexpected value in 1st tuple position', '', blob0, [e]);
            } else {
                throw e;
            }
        }

        try {
            t1 = decoderV(blob1);
        } catch (e) {
            if ('blob' in e) {
                throw (0, _asserts.DecodeError)('Unexpected value in 2nd tuple position', '', blob1, [e]);
            } else {
                throw e;
            }
        }

        return [t0, t1];
    };
}

/**
 * Given a mapping of fields-to-decoders, builds a decoder for an object type.
 *
 * For example, given decoders for a number and a string, we can construct an
 * "object description" like so:
 *
 *   { id: decodeNumber(), name: decodeString() }
 *
 * Which is of type:
 *
 *   { id: Decoder<number>, name: Decoder<string> }
 *
 * Passing this to decodeObject() will produce the following return type:
 *
 *   Decoder<{ id: number, name: string }>
 *
 * Put simply: it'll "peel off" all of the nested Decoders, puts them together
 * in an object, and wraps it in a Decoder<...>.
 */
function decodeObject(mapping) {
    return function (blob) {
        // Verify that blob actually _is_ a POJO and it has all the fields
        blob = asObject(blob);

        var result = {};
        Object.keys(mapping).forEach(function (key) {
            var decoder = mapping[key];
            var value = blob[key];
            try {
                result[key] = decoder(value);
            } catch (e) {
                if ('blob' in e) {
                    throw (0, _asserts.DecodeError)('Unexpected object shape', 'Expected object to have "' + key + '" field matching its expected type', blob, [e]);
                } else {
                    throw e;
                }
            }
        });
        return result;
    };
}

/**
 * Given a JSON object, will decode a Map of string keys to whatever values.
 *
 * For example, given a decoder for a Person, we can decode a Person lookup table
 * structure (of type Map<string, Person>) like so:
 *
 *   decodeMap(decodePerson())
 *
 */
function decodeMap(decoder) {
    return function (blob) {
        // Verify that blob actually _is_ a POJO and it has all the fields
        blob = asObject(blob);

        var result = new Map();
        Object.entries(blob).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                id = _ref2[0],
                value = _ref2[1];

            try {
                result.set(id, decoder(value));
            } catch (e) {
                if ('blob' in e) {
                    throw (0, _asserts.DecodeError)('Unexpected value', 'Expected value under key "' + id + '" to match its expected type', blob, [e]);
                } else {
                    throw e;
                }
            }
        });
        return result;
    };
}

function decodeField(field, decoder) {
    return function (blob) {
        // Verify that blob actually _is_ a POJO and it has all the fields
        blob = asObject(blob);

        var value = blob[field];
        try {
            return decoder(value);
        } catch (e) {
            if ('blob' in e) {
                throw (0, _asserts.DecodeError)('Unexpected field value for field "' + field + '"', 'Expected object to have "' + field + '" field matching its expected type', blob, [e]);
            } else {
                throw e;
            }
        }
    };
}

function oneOf(alt1, alt2) {
    return function (blob) {
        var parents = [];
        var _arr = [alt1, alt2];
        for (var _i = 0; _i < _arr.length; _i++) {
            var _decoder = _arr[_i];
            try {
                return _decoder(blob);
            } catch (e) {
                if ('blob' in e) {
                    parents.push(e);
                    continue;
                } else {
                    throw e;
                }
            }
        }

        throw (0, _asserts.DecodeError)('None of the allowed alternatives matched', "I've tried to match the following alternatives in order, but none of them could decode the input.", blob, parents);
    };
}

function oneOf3(alt1, alt2, alt3) {
    return oneOf(alt1, oneOf(alt2, alt3));
}

function oneOf4(alt1, alt2, alt3, alt4) {
    return oneOf(oneOf(alt1, alt2), oneOf(alt3, alt4));
}