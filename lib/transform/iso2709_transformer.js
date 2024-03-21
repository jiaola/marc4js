import { Transform } from "stream";
import util from "util";

var Iso2709Transformer = function (opts) {
    opts = opts || {};
    Transform.call(this, opts);
    opts.objectMode = true;
    this.objectMode = true; //opts.objectMode || false;
    this.encoding = opts.encoding;
};

util.inherits(Iso2709Transformer, Transform);

Iso2709Transformer.prototype._transform = function (
    record,
    encoding,
    callback
) {
    this.push(record);
    return callback();
};

Iso2709Transformer.prototype.write = function (chunk, encoding, callback) {
    var record = chunk;
    try {
        chunk = record.marshal();
    } catch (err) {
        callback(err);
    }
    return Transform.prototype.write.call(this, chunk, encoding, callback);
};

export default Iso2709Transformer;
