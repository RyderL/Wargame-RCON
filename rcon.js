/*!
 * node-rcon
 * Copyright(c) 2012 Justin Li <j-li.net>
 * MIT Licensed
 */

const EventEmitter = require('events'),
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
class Rcon extends EventEmitter {
  constructor(host, port, password, options) {
    super();
    options = options || {};

    this.host = host;
    this.port = port;
    this.password = password;
    this.rconId = options.id || 0x0012D4A6; // This is arbitrary in most cases
  }

  send(data, cmd, id) {
    var sendBuf;

    cmd = cmd || PacketType.COMMAND;
    id = id || this.rconId;
  
    let length = [...Buffer.from(data)].length;
  
    sendBuf = new Buffer.alloc(length + 16);
    sendBuf.writeInt32LE(length + 12, 0);
    sendBuf.writeInt32LE(id, 4);
    sendBuf.writeInt32LE(cmd, 8);
    sendBuf.write(data, 12);
    sendBuf.writeInt32LE(0, length + 12);
  
    this._sendSocket(sendBuf);
  }

  connect() {
    var self = this;

    this._tcpSocket = net.createConnection(this.port, this.host);
    this._tcpSocket.on('data', function (data) {
        try {
          self._tcpSocketOnData(data)
        } catch(e) {
          
        }
      })
      .on('connect', function () {
        self.socketOnConnect()
      })
      .on('error', function (err) {
        self.emit('error', {id: self.rconId, message: err});
      })
      .on('end', function () {
        self.emit('end', {id: self.rconId, message: "unknown"});
      });
  }

  _sendSocket(buf) {
    if(this._tcpSocket.readyState != "open") {
      return;
    }
    
    this._tcpSocket.write(buf.toString('binary'), 'binary');
  }

  disconnect() {
    if (this._tcpSocket) this._tcpSocket.end();
  }

  setTimeout(timeout, callback) {
    if (!this._tcpSocket) return;
  
    var self = this;
    this._tcpSocket.setTimeout(timeout, function () {
      self._tcpSocket.end();
      if (callback) callback();
    });
  };

  _tcpSocketOnData(incomingPacket) {
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

  socketOnConnect() {
    this.emit('connect');
    this.send(this.password, PacketType.AUTH);
  }
}

module.exports = Rcon;