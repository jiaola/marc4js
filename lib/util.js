'use strict';

exports.isInt = function (val) {
    return /^\d+$/.test(val);
};

/** A formatter that pad 0 in front of an integer if the number of
 * digit is less than numDigits (default numDigits is 5). If
 * the number of digits in the integer is greater than numDigits, it will
 * return a string of length numDigits and all digits are 9s.
 */
exports.formatInteger = function (val, numDigits) {
    numDigits = typeof numDigits !== 'undefined' ? numDigits : 5;
    var s = val + "";
    var v = "";
    if (s.length > numDigits) {
        while (v.length < numDigits) v = '9' + v;
    } else {
        v = s;
        while (v.length < numDigits) v = '0' + v;
    }
    return v;
};

exports.isControlField = function (tag) {
    if (tag.length == 3 && tag.charAt(0) == '0' && tag.charAt(1) == '0' && tag.charAt(2) >= '0' && tag.charAt(2) <= '9')// if (Integer.parseInt(tag) < 10)
        return true;
    return false;
};

/**
 * Convert leader encoding code to encoding names
 * TODO: right now it converts everything UTF-8. Need to convert to MARC8
 */
exports.codeToEncoding = function (code) {
    if (code == 'a') {
        return "utf8"
    } else if (code == ' ') {
        return 'utf8';
    } else if (code == '#') {
        return 'UTF-8';
    } else {
        return undefined;
    }
};

/**
 * Convert encoding names to leader encoding char
 * TODO: Only converts to UTF8. Make it work for MARC8 too
 */
exports.encodingToCode = function (encoding) {
    if (encoding.toUpperCase() === "UTF-8" || encoding.toUpperCase() === 'UTF8') {
        return 'a';
    } else {
        return '#';
    }
};
