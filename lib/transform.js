'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.map = map;


/**
 * Create a decoder that, when decoding A works, will allow you to generate a decoder B on
 * the fly, based on the parsed-out value of A, then continue feeding that decoder the
 * original blob.
 */
function map(decoder, mapper) {
    return function (blob) {
        var value = decoder(blob);
        return mapper(value);
    };
}