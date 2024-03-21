import { Transform } from "stream";
import util from "util";
import * as Util from "../util.js";
import ControlField from "../marc/control_field.js";
import DataField from "../marc/data_field.js";
import Subfield from "../marc/subfield.js";
import Record from "../marc/record.js";
import Leader from "../marc/leader.js";

var TextParser = function (opts) {
    opts = opts || {};
    opts.objectMode = true; // this has to be true. Emit only Record objects

    Transform.call(this, opts);

    this.lines = [];

    // position of cursor
    this.row = 0;
    this.col = 0;
};

util.inherits(TextParser, Transform);

TextParser.prototype._transform = function (chunk, encoding, callback) {
    if (typeof chunk == "string" || chunk instanceof String) {
        chunk = new Buffer(chunk, encoding);
    }

    var lines, i;
    lines = chunk.toString().split("\n");
    for (i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        this.row += 1;
        if (!line) {
            continue;
        }
        if (line.substr(0, 3) === "LDR") {
            if (this.lines.length > 0) {
                var record;
                try {
                    record = this._parse(this.lines);
                } catch (err) {
                    this.emit("error", err);
                }
                this.push(record);
                this.lines = [];
            }
        }
        this.lines.push(line);
    }
    return callback();
};

TextParser.prototype._flush = function (callback) {
    if (this.lines.length > 0) {
        var record;
        try {
            record = this._parse(this.lines);
        } catch (err) {
            this.emit("error", err);
        }
        this.push(record);
        this.lines = [];
    }
    return callback();
};

TextParser.prototype._parse = function (lines) {
    var record = new Record();
    lines.forEach(function (line) {
        var tag = line.substr(0, 3);
        if (tag === "LDR") {
            record.leader = new Leader(line.substr(7));
        } else {
            var field;
            if (Util.isControlField(tag)) {
                field = new ControlField();
                field.data = line.substr(7);
            } else {
                field = new DataField();
                var data = line.substr(4);
                field.indicator1 = data.charAt(0);
                field.indicator2 = data.charAt(1);
                if (isNaN(field.indicator1)) {
                    throw new MarcError(
                        "Wrong indicator format. It has to be a number or a space"
                    );
                }
                if (isNaN(field.indicator2)) {
                    throw new MarcError(
                        "Wrong indicator format. It has to be a number or a space"
                    );
                }
                data.substr(4)
                    .split("$")
                    .forEach(function (sf) {
                        field.addSubfield(
                            new Subfield(sf.charAt(0), sf.substr(1))
                        );
                    });
            }
            field.tag = tag;
            record.addVariableField(field);
        }
    });
    return record;
};

export default TextParser;
