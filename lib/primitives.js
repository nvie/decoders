'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.decodeValue = decodeValue;
exports.decodeConstant = decodeConstant;
exports.decodeUndefined = decodeUndefined;
exports.decodeNull = decodeNull;
exports.decodeBoolean = decodeBoolean;
exports.decodeString = decodeString;
exports.decodeNumber = decodeNumber;
exports.fail = fail;

var _asserts = require('./asserts');

/**
 * Decodes any hardcoded value, without looking at the input data.
 */
function decodeValue(value) {
    return function () {
        return value;
    };
}

/**
 * Decodes any constant value.
 */


function decodeConstant(value) {
    return function (blob) {
        (0, _asserts.assertTest)(blob, function (blob) {
            return blob === value;
        }, 'Not ' + JSON.stringify(value), 'Expected the constant value ' + JSON.stringify(value));
        return value;
    };
}

/**
 * Decodes the undefined value.
 */
function decodeUndefined() {
    return function (blob) {
        (0, _asserts.assertType)(blob, 'undefined');
        return undefined;
    };
}

/**
 * Decodes the null value.
 */
function decodeNull() {
    return decodeConstant(null);
}

/**
 * Decodes a boolean value.
 * Will throw a DecodeError if anything other than a boolean value is found.
 */
function decodeBoolean() {
    return function (blob) {
        (0, _asserts.assertType)(blob, 'boolean');
        return blob;
    };
}

/**
 * Decodes a string value.
 * Will throw a DecodeError if anything other than a string value is found.
 */
function decodeString() {
    return function (blob) {
        (0, _asserts.assertType)(blob, 'string');
        return blob;
    };
}

/**
 * Decodes a finite (!) number (integer or float) value.
 * Will throw a DecodeError if anything other than a finite number value is
 * found.  This means that, even though values like NaN, or positive and
 * negative infinity are not considered valid numbers.
 */
function decodeNumber() {
    return function (blob) {
        (0, _asserts.assertTest)(blob, Number.isFinite, 'Not a number', 'Expected a finite number');
        return blob;
    };
}

/**
 * A decoder that will always fail when used.
 */
function fail(message, detail) {
    return function (blob) {
        throw (0, _asserts.DecodeError)(message, detail, blob);
    };
}