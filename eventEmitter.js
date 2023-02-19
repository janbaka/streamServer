const EventEmitter = require("events");

class DataEmitter extends EventEmitter {}

const dataEmitter = new DataEmitter();

module.exports = dataEmitter;
