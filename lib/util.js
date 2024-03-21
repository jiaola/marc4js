export function isInt(val) {
    return /^\d+$/.test(val);
}

/** A formatter that pad 0 in front of an integer if the number of
 * digit is less than numDigits (default numDigits is 5). If
 * the number of digits in the integer is greater than numDigits, it will
 * return a string of length numDigits and all digits are 9s.
 */
export function formatInteger(val, numDigits) {
    numDigits = typeof numDigits !== "undefined" ? numDigits : 5;
    var s = val + "";
    var v = "";
    if (s.length > numDigits) {
        while (v.length < numDigits) v = "9" + v;
    } else {
        v = s;
        while (v.length < numDigits) v = "0" + v;
    }
    return v;
}

export function isControlField(tag) {
    if (
        tag.length == 3 &&
        tag.charAt(0) == "0" &&
        tag.charAt(1) == "0" &&
        tag.charAt(2) >= "0" &&
        tag.charAt(2) <= "9"
    )
        // if (Integer.parseInt(tag) < 10)
        return true;
    return false;
}
