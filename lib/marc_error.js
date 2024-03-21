var MarcError = function (message) {
    Error.captureStackTrace(this);
    this.message = message;
    this.name = "MarcError";
};

MarcError.prototype = Object.create(Error.prototype);

export default MarcError;
