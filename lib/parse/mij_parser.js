import clarinet from "clarinet";
import util from "util";
import { Transform } from "stream";
import Record from "../marc/record.js";
import ControlField from "../marc/control_field.js";
import DataField from "../marc/data_field.js";
import Subfield from "../marc/subfield.js";
import Leader from "../marc/leader.js";

function MijParser(opts) {
    if (!(this instanceof MijParser)) return new MijParser(opts);
    opts = opts || {};
    opts.objectMode = true; // this has to be true. Emit only Record objects
    opts.highWaterMark = 16; // max. # of output records buffered
    Transform.call(this, opts);

    this.init();

    // See https://github.com/dscape/clarinet for more info
    this.stream = clarinet.createStream({});
    this.stream.on("error", this.handleSaxError.bind(this));
    this.stream.on("openobject", this.handleOpenObject.bind(this));
    this.stream.on("closeobject", this.handleCloseObject.bind(this));
    this.stream.on("value", this.handleValue.bind(this));
    this.stream.on("key", this.handleKey.bind(this));
    this.stream.once("end", this.handleEnd.bind(this));
}
util.inherits(MijParser, Transform);

MijParser.prototype.init = function () {
    this.stack = [];
    this.keyStack = [];
    this.previous = "";
    this.arrayStack = [];
};

MijParser.prototype.handleEnd = function () {
    this.stream.removeListener("error", this.handleSaxError.bind(this));
    this.stream.removeListener("openobject", this.handleOpenObject.bind(this));
    this.stream.removeListener(
        "closeobject",
        this.handleCloseObject.bind(this)
    );
    this.stream.removeListener("value", this.handleValue.bind(this));
    this.stream.removeListener("key", this.handleKey.bind(this));
    this.push(null);
};

MijParser.prototype.handleSaxError = function (e) {
    this.emit("error", e);
    if (this.options.resume_saxerror) {
        if (this.stream._parser) {
            this.stream._parser.error = null;
            this.stream._parser.resume();
        }
    }
};

MijParser.prototype.handleError = function (e) {
    this.emit("error", e);
};

MijParser.prototype.handleOpenObject = function (key) {
    this.previous = key;
    this.keyStack.push(key);
    var obj = null;
    if (/\d{3}/.test(key)) {
        // field
        obj = parseInt(key) < 10 ? new ControlField() : new DataField();
        obj.tag = key;
    } else if (key.length == 1) {
        // subfield
        obj = new Subfield();
        obj.code = key;
    } else if (key == "leader" || key == "fields") {
        obj = new Record();
    }
    if (obj != null) this.stack.push(obj);
};

MijParser.prototype.handleCloseObject = function () {
    var key = this.keyStack.pop();
    if (key == "subfields" || key == "fields") {
        return;
    }
    var obj = this.stack.pop();
    if (obj instanceof Subfield) {
        var field = this.stack.pop();
        field.addSubfield(obj);
        this.stack.push(field);
    } else if (obj instanceof ControlField || obj instanceof DataField) {
        var record = this.stack.pop();
        record.addVariableField(obj);
        this.stack.push(record);
    } else if (obj instanceof Record) {
        if (
            this.arrayStack.length == 0 ||
            this.arrayStack[this.arrayStack.length - 1] == ""
        ) {
            this.previous = "";
            this.push(obj);
        }
    }
};

MijParser.prototype.handleValue = function (value) {
    if (this.previous == "ind1") {
        var field = this.stack.pop();
        field.indicator1 = value;
        this.stack.push(field);
    } else if (this.previous == "ind2") {
        var field = this.stack.pop();
        field.indicator2 = value;
        this.stack.push(field);
    } else if (this.previous.length == 1) {
        var subfield = this.stack.pop();
        subfield.data = value;
        this.stack.push(subfield);
    } else if (/\d{3}/.test(this.previous)) {
        var field = this.stack.pop();
        field.data = value;
        this.stack.push(field);
    } else if (this.previous == "leader") {
        var leader = new Leader(value);
        var record = this.stack.pop();
        record.leader = leader;
        this.stack.push(record);
    }
};

MijParser.prototype.handleKey = function (key) {
    this.previous = key;
};

// Naive Stream API
MijParser.prototype._transform = function (data, encoding, done) {
    try {
        this.stream.write(data);
        done();
    } catch (e) {
        done(e);
        this.push(null); // Manually trigger and end, since we can't reliably do any more parsing
    }
};

export default MijParser;
