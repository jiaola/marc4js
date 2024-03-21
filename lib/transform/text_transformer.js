import { Transform } from "stream";
import util from "util";
import os from "os";
import ControlField from "../marc/control_field.js";

var TextTransformer = function (opts) {
    opts = opts || {};
    this.objectMode = opts.objectMode || false;
    this.encoding = opts.encoding || "utf8";

    Transform.call(this, opts);
};

util.inherits(TextTransformer, Transform);

TextTransformer.prototype._transform = function (record, encoding, callback) {
    this.push(record);
    return callback();
};

TextTransformer.prototype.write = function (chunk, encoding, callback) {
    var record = chunk;
    var buffers = [];
    if (typeof encoding === "undefined") {
        encoding = this.encoding;
    }
    try {
        buffers.push(new Buffer("LDR    ", encoding));
        buffers.push(new Buffer(record.leader.marshal(), encoding));
        buffers.push(new Buffer(os.EOL, encoding));

        // write directory
        record.variableFields.forEach(function (field) {
            buffers.push(new Buffer(field.tag + " ", encoding));
            if (field instanceof ControlField) {
                buffers.push(new Buffer("   ", encoding));
                buffers.push(new Buffer(field.data, encoding));
                buffers.push(new Buffer(os.EOL));
            } else {
                buffers.push(new Buffer(field.indicator1, encoding));
                buffers.push(new Buffer(field.indicator2, encoding));
                buffers.push(new Buffer(" ", encoding));
                field.subfields.forEach(function (subfield) {
                    buffers.push(new Buffer("$" + subfield.code, encoding));
                    buffers.push(new Buffer(subfield.data, encoding));
                });
                buffers.push(new Buffer(os.EOL));
            }
        });

        buffers.push(new Buffer(os.EOL));
        chunk = Buffer.concat(buffers);
    } catch (err) {
        console.log("error", err.stack);
        callback(err);
    }
    return Transform.prototype.write.call(this, chunk, encoding, callback);
};

export default TextTransformer;
