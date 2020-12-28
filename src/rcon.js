/*!
 * node-rcon
 * Copyright(c) 2012 Justin Li <j-li.net>
 * MIT Licensed
 */

var util = require('util'),
  events = require('events'),
  net = require('net'),
  Buffer = require('buffer').Buffer;


var PacketType = {
  COMMAND: 0x02,
  AUTH: 0x03,
  RESPONSE_VALUE: 0x00,
  RESPONSE_AUTH: 0x02
};

/**
 * options:
 *   tcp - true for TCP, false for UDP (optional, default true)
 *   challenge - if using UDP, whether to use the challenge protocol (optional, default true)
 *   id - RCON id to use (optional)
 */
function Rcon(host, port, password, options) {
  if (!(this instanceof Rcon)) return new Rcon(host, port, password, options);
  options = options || {};

  this.host = host;
  this.port = port;
  this.password = password;
  this.rconId = options.id || 0x0012D4A6; // This is arbitrary in most cases

  events.EventEmitter.call(this);
};

util.inherits(Rcon, events.EventEmitter);

Rcon.prototype.send = function (data, cmd, id) {
  var sendBuf;

  cmd = cmd || PacketType.COMMAND;
  id = id || this.rconId;

  sendBuf = new Buffer.alloc(data.length + 16);
  sendBuf.writeInt32LE(data.length + 12, 0);
  sendBuf.writeInt32LE(id, 4);
  sendBuf.writeInt32LE(cmd, 8);
  sendBuf.write(data, 12);
  sendBuf.writeInt32LE(0, data.length + 12);

  this._sendSocket(sendBuf);
};

Rcon.prototype._sendSocket = function (buf) {
  if(this._tcpSocket.readyState != "open") {
    return;
  }
  
  this._tcpSocket.write(buf.toString('binary'), 'binary');
};

Rcon.prototype.connect = function () {
  var self = this;

  this._tcpSocket = net.createConnection(this.port, this.host);
  this._tcpSocket.on('data', function (data) {
      self._tcpSocketOnData(data)
    })
    .on('connect', function () {
      self.socketOnConnect()
    })
    .on('error', function (err) {
      self.emit('error', err)
    })
    .on('end', function () {
      self.socketOnEnd()
    });
};

Rcon.prototype.disconnect = function () {
  if (this._tcpSocket) this._tcpSocket.end();
};

Rcon.prototype.setTimeout = function (timeout, callback) {
  if (!this._tcpSocket) return;

  var self = this;
  this._tcpSocket.setTimeout(timeout, function () {
    self._tcpSocket.end();
    if (callback) callback();
  });
};

Rcon.prototype._tcpSocketOnData = function (incomingPacket) {
  var size = incomingPacket.readInt32LE(0);
  var id = incomingPacket.readInt32LE(4);
  var type = incomingPacket.readInt32LE(8);
  var body = incomingPacket.toString("utf-8", 12, incomingPacket.length - 2);

  if (size >= 10) {
    if (id == this.rconId) {
      if (type == PacketType.RESPONSE_VALUE) {
        this.emit('response', {
          id: id,
          data: body
        });
      }
    } else {
      this.emit('error', new Error('Authentication failed'));
    }
  }
};

Rcon.prototype.socketOnConnect = function () {
  this.emit('connect');
  this.send(this.password, PacketType.AUTH);
};

Rcon.prototype.socketOnEnd = function () {
  this.emit('end');
};

module.exports = Rcon;