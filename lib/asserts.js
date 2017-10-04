'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.summarizer = summarizer;
exports.DecodeError = DecodeError;
exports.assertTest = assertTest;
exports.assertType = assertType;
function summarizer(key, value) {
    // Don't collapse the outer level
    if (!key) {
        return value;
    }

    if (Array.isArray(value)) {
        return '[...]';
    } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        return '{...}';
    }
    return value;
}

function DecodeError(message, details, blob) {
    var parents = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    var err = {
        message: message,
        details: details,
        blob: blob,
        parents: parents,
        format: function format() {
            var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            var msg = '';
            msg += prefix + 'Error: ' + err.message + '\n';
            msg += '' + prefix + err.details + '\n';
            msg += prefix + 'Actual: ' + JSON.stringify(err.blob, summarizer, 1) + '\n';
            if (err.parents.length > 0) {
                msg += prefix + 'Parent errors:\n';
                msg += err.parents.map(function (e) {
                    return e.format(prefix + '    ');
                }).join('\n');
            }
            return msg;
        },
        toString: function toString() {
            return this.format();
        }
    };
    return err;
}

/**
 * Helper to enforce a runtime check on the given value.  No-op if the given blob
 * matches the predicate, but throws a decoding runtime error otherwise.
 */
function assertTest(blob, predicate, message, details) {
    if (!predicate(blob)) {
        throw DecodeError(message, details, blob);
    }
}

/**
 * Helper to enforce a runtime type check on the given value.
 */
function assertType(blob, jsType) {
    return assertTest(blob, function (x) {
        return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === jsType;
    }, 'Not a ' + jsType, 'Expected a "' + jsType + '" value');
}