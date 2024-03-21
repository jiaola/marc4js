import iso2709 from "./parse/iso2709_parser.js";
import marc from "./parse/iso2709_parser.js";
import text from "./parse/text_parser.js";
import mrk from "./parse/mrk_parser.js";
import marcxml from "./parse/marcxml_parser.js";
import xml from "./parse/marcxml_parser.js";
import json from "./parse/mij_parser.js";
import mij from "./parse/mij_parser.js";

export default function parse() {
    var callback, called, records, data, options, parser;
    if (arguments.length === 3) {
        data =
            typeof arguments[0] === "undefined" || arguments[0] === null
                ? ""
                : arguments[0];
        options = arguments[1];
        callback = arguments[2];
    } else if (arguments.length === 2) {
        if (typeof arguments[0] === "string") {
            data = arguments[0];
        } else {
            options = arguments[0];
        }
        if (typeof arguments[1] === "function") {
            callback = arguments[1];
        } else {
            options = arguments[1];
        }
    } else if (arguments.length === 1) {
        if (typeof arguments[0] === "function") {
            callback = arguments[0];
        } else {
            options = arguments[0];
        }
    }
    if (options == null) {
        options = {};
    }

    var parsers = {
        iso2709,
        marc,
        text,
        mrk,
        marcxml,
        xml,
        json,
        mij,
    };

    var format = options.format || options.fromFormat || "iso2709";
    var Parser = parsers[format];
    parser = new Parser(options);
    if (typeof data !== "undefined") {
        process.nextTick(function () {
            parser.write(data);
            return parser.end();
        });
    }
    if (callback) {
        called = false;
        records = [];

        var handleData = function (record) {
            records.push(record);
        };
        parser.on("data", handleData);
        parser.once("error", function (err) {
            called = true;
            parser.removeListener("data", handleData);
            return callback(err);
        });
        parser.once(
            "end",
            function () {
                if (!called) {
                    parser.removeListener("data", handleData);
                    return callback(null, records);
                }
            }.bind(parser)
        );
    }
    return parser;
}
