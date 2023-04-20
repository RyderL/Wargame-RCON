const fs = require('fs');
const readline = require('readline');
const pino = require("pino");

const logger = pino("./rcon.log");

const express = require('express');
const app = express();
const http = require('http').Server(app);
const geoip = require('geoip-lite');
const levelup = require('levelup');
const leveldown = require('leveldown');
const Tail = require('tail').Tail;
const io = require('socket.io')(http);
const axios = require('axios').default;

const config = require('./config');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.PORT || 8081;

const Rcon = require('./rcon');
const DeckDecoder = require('./assets/js/deck-decoder');
const { join } = require('path');

const db = levelup(leveldown('./db'))

app.use('/assets', express.static('assets'));

const HOST_CHECK_REGEXP = /^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]):([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
 
global.mapping = {lastIndex: 0};
global.cache = {};
global.log = {tail: {}};
global.message = {tail: {}};
global.init = {};
global.map = {};
global.queue = {log: {}, message: {}};
global.timer = {};
global.retry = {};
global.motd = {};
global.replacement = {source: [], target: []};
global.bannedList = [];

const DECK_TYPE_MAPPING = {"0": "Motorised", "1": "Armored", "2": "Support", "3": "Marine", "4": "Mecanized", "5": "Airborne", "6": "Naval"};
const DEFAULT_RESTRICT_NATION_VALUE = {blue: {type: 'BLUFOR', deck: ''}, red: {type: 'REDFOR', deck: ''}};
const DEFAULT_PLAYER_INFO = {id: null, name: '', deck: '', deckName: '', elo: 1500, level: 1};

// easiest token verification, i don't want to use JWT :D
const verifyToken = (req, res, next) => {
  const token = req.headers['x-token'];

  if(!token && token != config.globalBanToken) {
    return res.sendStatus(401);
  }

  next();
}

app.get('/', function (req, res) {
  res.sendFile( __dirname + "/index.html" );
});

app.get('/v2', function (req, res) {
  res.sendFile( __dirname + "/v2.html" );
});

app.get('/player/:id', async function(req, res){
  if(!req.params.id) {
    return;
  }

  res.send(await fetchPlayerInfo({id: req.params.id}));
});

app.get('/ban', function(req, res){
  res.send(global.bannedList);
});

app.post('/ban', verifyToken, async function(req, res) {
  let body = req.body;

  if(!(body.id && body.host)) {
    res.send({code: -1, message: "Parameter error"});
    return;
  }

  if(body.time == undefined || body.time == null || body.time < 0) {
    body.time = 0;
  }

  await saveBannedInfo({host: body.host, id: body.id, time: body.time, reason: body.reason, banned: body.banned, broadcast: true});

  if(body.banned) {
    commandHandler({host: body.host, cmd: `kick ${body.id}`});
  }
  
  res.send({code: 0, message: "ok"});
});

io.on('connection', (socket) => {
  socket.on('request-server-info', (host) => {
    broadcast(host);
  });

  socket.on('request-login', (data) => {
    if(!global.init.done) {
      return;
    }

    leaveRoom(socket);

    socket.join(data.host);

    loginHandler(data);
  });

  socket.on('request-update-rotation', (req) => {
    if(!verifyRequest(req) || req.data == undefined || req.data.constructor != Boolean) {
      return;
    }
  
    saveRotationStatus(req.id, req.host, req.data);
  });

  socket.on('request-update-rotation-list', (req) => {
    if(!verifyRequest(req) || req.data.constructor != Array) {
      return;
    }
  
    let list = [];
  
    for(let key in req.data) {
      let item = req.data[key];
  
      if(item) {
        list.push(item);
      }
    }
  
    saveRotationList({id: req.id, host: req.host, data: list});
  });

  socket.on('request-update-variable', (req) => {
    if(!verifyRequest(req) || !req.key || req.value.constructor != Object) {
      return;
    }

    let host = req.host;
  
    if(req.key == "Map") {
      let prefix = req.value.VictoryCond == 4 ? 'Conquete' : 'Destruction';
      commandHandler({host: host, cmd: `setsvar Map ${prefix}_${req.value.Map}`});
    } else if(req.key == "VictoryCond") {
      let prefix = req.value.VictoryCond == 4 ? 'Conquete' : 'Destruction';
      commandHandler({host: host, cmd: `setsvar VictoryCond ${req.value.VictoryCond}`});
      commandHandler({host: host, cmd: `setsvar Map ${prefix}_${req.value.Map}`});
    } else if(req.key == "TimeLimit") {
      commandHandler({host: host, cmd: `setsvar TimeLimit ${req.value.TimeLimit * 60}`});
    } else if(req.key == "MaxTeamSize") {
      commandHandler({host: host, cmd: `setsvar MaxTeamSize ${req.value[req.key]}`});
      commandHandler({host: host, cmd: `setsvar DeltaMaxTeamSize ${req.value[req.key]}`});
      commandHandler({host: host, cmd: `setsvar NbMinPlayer ${req.value[req.key] * 2}`});
      commandHandler({host: host, cmd: `setsvar NbMaxPlayer ${req.value[req.key] * 2}`});
    } else {
      commandHandler({host: host, cmd: `setsvar ${req.key} ${req.value[req.key]}`});
    }
  
    saveServerVariable({id: req.id, host: host, key: req.key, value: req.value[req.key]});  
  });
 
  let MANUAL_COMMAND_BAN_REGEX = /ban ([0-9]+) ([0-9]+)/;
  
  socket.on('request-exec-command', async (req) => {
    if(!verifyRequest(req) || !req.cmd) {
      return;
    }
  
    let cmd = req.cmd;
    let host = req.host;
  
    if(cmd == 'unban' || cmd == 'kick') {
      commandHandler({host: host, cmd: `${cmd} ${req.uid}`});
      saveBannedInfo({id: req.uid, banned: false, broadcast: true});
    } else if(cmd == 'ban') {
      // Deprecate
      // commandHandler({host: host, cmd: `${cmd} ${req.uid} ${req.value}`});
      
      commandHandler({host: host, cmd: `kick ${req.uid}`});

      await saveBannedInfo({host: host, id: req.uid, time: req.value, banned: true, broadcast: true});
    } else if(cmd == 'alliance') {
      commandHandler({host: host, cmd: `setpvar ${req.uid} PlayerAlliance ${req.value}`});
    } else if(cmd == 'deck') {
      commandHandler({host: host, cmd: `setpvar ${req.uid} PlayerDeckContent ${req.value}`});
    } else if(cmd == 'launch' || cmd == 'cancel_launch') {
      commandHandler({host: host, cmd: cmd});
    } else if(req.manual) {
      let m = MANUAL_COMMAND_BAN_REGEX.exec(cmd);
      
      if(m && m.length >= 0) {
        commandHandler({host: host, cmd: `kick ${m[1]}`});
        await saveBannedInfo({host: host, id: m[1], time: m[2], banned: true, broadcast: true});
        return;
      }

      commandHandler({host: host, cmd: cmd});
    }  
  });

  socket.on('request-update-restrict', (req) => {
    if(!verifyRequest(req) || !req.deck) {
      return;
    }

    saveRestrict(req.id, req.host, {deck: req.deck, blue: req.blue, red: req.red, min: req.min || 0, max: req.max || 0, nation: req.nation || DEFAULT_RESTRICT_NATION_VALUE});
  });

  socket.on('request-update-motd', (req) => {
    if(!verifyRequest(req)) {
      return;
    }

    saveMOTD(req.id, req.host, req.motd);
  });

  socket.on('request-player-list', async (req) => {
    if(!verifyRequest(req)) {
      return;
    }

    await broadcastPlayerList(req.host);

    fetchRemotePlayerList(req.host);
  });

  socket.on('request-ban-player', async (req) => {
    if(!verifyRequest(req)) {
      return;
    }

    let params = {id: req.uid, time: req.time, reason: req.reason, banned: true, host: req.host, broadcast: true};

    await saveBannedInfo(params);

    commandHandler({host: req.host, cmd: `kick ${req.uid}`});

    if(config.globalBan) {
      axios.post(`${config.globalBanUrl}/ban`, params, {headers: {'Content-Type': 'application/json', 'X-Token': config.globalBanToken}});
    }
  });

  socket.on('request-change-player-name', async (req) => {
    if(!verifyRequest(req)) {
      return;
    }

    commandHandler({host: req.host, cmd: `setpvar ${req.uid} PlayerName ${req.name}`});
  });
  
  socket.on('request-reset-player-list', async (req) => {
    if(!verifyRequest(req)) {
      return;
    }
    
    let host = req.host;

    global.cache[host].players = [];

    broadcastPlayerList(host);
  })

  socket.on('reload-replacement', async (req) => {
    if(!verifyRequest(req)) {
      return;
    }

    let data = await fetchReplacement();

    global.replacement = data;

    io.to(req.host).emit('update-replacement', {host: req.host, data: global.replacement})
  })

  socket.on('set-replacement', async (req) => {
    if(!verifyRequest(req)) {
      return;
    }

    if(!req.source || !req.target || req.source.constructor != Array || req.target.constructor != Array) {
      return;
    }

    global.replacement = {source: req.source, target: req.target};

    await save("replacement", global.replacement);

    io.to(req.host).emit('update-replacement', {host: req.host, data: global.replacement})
  })
});

const leaveRoom = function(socket) {
  let rooms = Object.keys(socket.rooms);
  rooms.forEach(function(room){
    socket.leave(room);
  });
}

// broadcast the current various information of the server
const broadcast = async function(host) {
  if(!global.cache[host]) {
    return;
  }

  let settings = global.cache[host].variable;
  let autoRotation = global.cache[host].rotation;
  let rotationList = global.cache[host].rotationList;
  let bannedList = global.bannedList;
  let state = fetchtServerState(host);
  let time = global.cache[host].time;
  let countdown = global.cache[host].countdown;
  let logs = global.log[host];
  let messages = global.message[host];
  let restrict = global.cache[host].restrict;
  let mode = global.init[host] ? '1' : '2';
  let motd = await fetchMOTD(host);
  let now = new Date().getTime();
  let replacement = global.replacement;

  let playerList = [];

  if(global.init[host]) {
    for(let x of global.cache[host].players) {
      let player = await fetchPlayerInfo({id: x.id, name: 'Unknown'});

      if(!player.status) {
        player.status = "Waiting";
      }

      playerList.push(player);
    }
  } else {
    playerList = global.cache[host].players;
  }

  playerList.sort((a, b) => a.alliance - b.alliance);

  io.to(host).emit("update-server-info", {host, autoRotation, rotationList, bannedList, playerList, logs, messages, settings, state, time, now, countdown, restrict, mode, motd, replacement});
}

const verifyRequest = function(req) {
  return req && req.host && req.password && hasConnected(req.host) && global.cache[req.host].info.password == req.password;
}

const hasConnected = function(host) {
  return global.cache[host] && global.cache[host].connected;
}

const loginHandler = async function(data) {
  let host = data.host.trim();

  if(!HOST_CHECK_REGEXP.exec(host)) {
    return;
  }

  logger.info(`Host: ${host}, Pwd: ${data.password}, connecting...`);

  if(!global.mapping[host]) {
    global.mapping.lastIndex = global.mapping.lastIndex + 1;
    global.mapping[host] = global.mapping.lastIndex;
    global.mapping[global.mapping.lastIndex] = host;
  }
  
  if(!global.cache[host]) {
    global.cache[host] = {loginUsers: []};
  } else if(global.cache[host].connected) {
    
    if(data.id && global.cache[host].info) {
      io.emit("response-login-" + data.id, global.cache[host].info.password == data.password);
    }

    return;
  }

  let array = host.split(":");

  if(array.length != 2 && array[0].length <= 7 && array[1].length == 0 && isNaN(array[1])) {
    return;
  }

  if(global.cache[host].loginUsers.indexOf(data.id) == -1) {
    global.cache[host].loginUsers.push(data.id);
  }

  logger.info("Host: " + host + ", Connecting to server");

  global.cache[host].connected = false;
  global.cache[host].tmp = {host: host, password: data.password};
  global.cache[host].players = [];
  global.cache[host].rcon = null;
  global.cache[host].rcon = new Rcon(array[0].trim(), array[1].trim(), data.password, {id: global.mapping[host]});
  global.cache[host].rcon.on('response', responseHandler);
  global.cache[host].rcon.on('error', errorHandler);
  global.cache[host].rcon.on('end', errorHandler);
  global.cache[host].rcon.connect();
}

const commandHandler = function(data) {
  if(!hasConnected(data.host)) {
    return;
  }

  logger.info("Host: " + data.host + ", Send command: " + data.cmd);
  global.cache[data.host].rcon.send(data.cmd);
}

const errorHandler = function(res) {
  let host = global.mapping[res.id];
  let connected = false;
  
  if(global.cache[host]) {
    connected = global.cache[host].connected;
  }

  logger.info("Host: " + host + ", Disconnect from server");

  global.cache[host].connected = false;

  if(!global.cache[host].info || !global.cache[host]) {
    return;
  }

  let password = global.cache[host].info.password;
  
  if(connected) {
    if(global.retry[host] && global.retry[host] > 3) {
      return;
    }
    
    logger.info("Host: " + host +", Reconnecting...");

    setTimeout(() => {
      global.retry[host] = (global.retry[host] || 0) + 1;
      loginHandler({host, password});
    }, 1000);
  }
}

const responseHandler = async function(res) {
  let data = res.data;
  let host = global.mapping[res.id];

  global.retry[host] = 0;
  
  if(!global.cache[host]) {
    return;
  }

  if(!global.cache[host].connected) {
    global.cache[host].connected = true;

    if(global.cache[host].tmp) {
      global.cache[host].info = global.cache[host].tmp;
      delete global.cache[host].tmp;
    }

    // update server login info
    await saveServerInfo(global.cache[host].info);

    logger.info("Host: " + global.mapping[res.id] + ", Connected to the server");

    // reload deck restrict info
    global.cache[host].restrict = await fetchRestrict(host);

    // broadcast login success events to users who need it
    if(global.cache[host].loginUsers) {
      for(let id of global.cache[host].loginUsers) {
        io.to(host).emit("response-login-" + id, true);
      }

      global.cache[host].loginUsers = [];
    }

    if(!global.init[host]) {
      if(global.timer[host]) {
        return;
      }

      global.timer[host] = setInterval(() => {
        fetchRemotePlayerList(host);
      }, 1000);
    }

    // reload player list
    let players = await fetchData(host, 'player', []);

    if(players.constructor != Array) {
      players = [];
    }

    global.cache[host].players = players;
  } else if(data.indexOf('Client List :') > -1){
    // this code does not support the modified server

    let list = data.replace('\0','').replace('Client List :\n','').split('\n');

    global.cache[host].players = [];

    if(!(list.length == 1 && list[0] == "Server is empty !")) {
      for (let line of list) {
        let str = line.trim();
  
        if(str && str != '') {
          let idx = str.indexOf(' ');
          let id = str.substr(0, idx);
          let name = str.substr(idx + 1);
          
          global.cache[host].players.push({id: id, name: name});
        }
      }
    }

    broadcastPlayerList(host);
  } else {
    
  }
  
}

const chat = function(host, msg) {
  global.cache[host] && global.cache[host].rcon && global.cache[host].rcon.send(`chat FFFFFFFF FFFFFFFF ${msg}`);
}

const fetchRemotePlayerList = function(host) {
  if(!hasConnected(host)) {
    return;
  }
  
  global.cache[host].rcon.send('display_all_clients');
}

const fetchtServerState = function(host) {
  if(!global.cache[host] || !global.cache[host].state) {
    return 'Unknown';
  }

  return global.cache[host].state;
}

const updateServerState = function(host, state) {
  if(!global.cache[host]) {
    return;
  }

  let countdown = 0;

  if(global.cache[host]) {
    switch(state) {
      case 'Countdown':
        countdown = global.cache[host].variable.WarmupCountdown;
        break;
      case 'Loading':
        countdown = global.cache[host].variable.LoadingTimeMax;
        break;
      case 'Deploying':
        countdown = global.cache[host].variable.DeploiementTimeMax;
        break;
      case 'Game in progress':
        countdown = global.cache[host].variable.TimeLimit * 60;
        break;
      case 'Debriefing':
        countdown = global.cache[host].variable.DebriefingTimeMax
        break;
      default:
        countdown = 0;
    }
  }
  
  let now = (new Date()).getTime();

  countdown *= 1000;

  io.to(host).emit("update-state", {host: host, state: state, time: now, now: now, countdown: countdown});

  global.cache[host].state = state;
  global.cache[host].countdown = countdown;
  global.cache[host].time = now;
}

const save = async function(key, value) {
  await db.put(key, JSON.stringify(value));
}

const fetchPlayerInfo = async function(params) {
  let info = null;
  
  try {
    info = await db.get(params.id);
    info = JSON.parse(info);
  } catch {
    info = Object.assign({}, DEFAULT_PLAYER_INFO, params);
  }

  return info;
}

const fetchPlayerAllianceFromCache = function(host, id) {
  let exists = global.cache[host].players.find(x => x.id == id);

  if(exists) {
    return exists.alliance;
  }

  return -1;
}

const fetchPlayerAlliance = function(host, alliance) {
  if(alliance != null) {
    return alliance;
  }

  let blue = global.cache[host].players.filter(x => x.alliance == 0).length;
  
  return global.cache[host].players.length - blue > blue ? 1 : 0;
}

const saveHostPlayers = function(host, id, connected, newAlliance) {
  if(!(host && id && global.cache[host])) {
    return;
  }

  if(!global.cache[host].players) {
    global.cache[host].players = [];
  }

  let exists = global.cache[host].players.find(x => x.id == id);

  if(connected) {
    let alliance = fetchPlayerAlliance(host, newAlliance);

    if(exists) {
      exists.alliance = alliance;
    } else {
      global.cache[host].players.push({id, alliance});
    } 

    broadcastPlayerList(host);

    return;
  }

  let idx = global.cache[host].players.findIndex(x => x.id == id);

  global.cache[host].players.splice(idx, 1);

  if(idx == -1) {
    return;
  }
  
  broadcastPlayerList(host);
}

const broadcastPlayerList = async function(host) {
  let items = [];

  await save(host + "-player", global.cache[host].players);

  for(let x of global.cache[host].players) {
    let player = await fetchPlayerInfo({id: x.id, name: 'Unknown'});

    if(!player.status) {
      player.status = "Waiting";
    }

    items.push(player);
  }

  items.sort((a, b) => a.alliance - b.alliance);

  io.to(host).emit('update-player-list', {host, items})
}

const broadcastMOTD = async function(host) {
  let data = await fetchMOTD(host);

  if(!(data && data.trim().length)) {
    return;
  }

  chat(host, data);
}

const fetchMOTD = async function(host) {
  let info = null;
  
  try {
    info = await db.get(host + "-MOTD");
    info = JSON.parse(info).value;
  } catch {
    info = "";
  }

  return info;
}

const saveMOTD = async function(id, host, value) {
  await save(host + "-MOTD", {value});
}

const setPlayerDeck = async function(host, uid, deck) {
  let check = new DeckDecoder(deck);

  if(check.side == 'NONE') {
    return;
  }

  global.cache[host].rcon.send(`setpvar ${uid} PlayerDeckContent ${deck}`);
}

const savePlayerInfo = async function(host, params) {
  let info = null;
  
  try {
    info = JSON.parse(await db.get(params.id));

    if(params.status && info.status && params.status == "Ready" && info.status == "Battle") {
      params.status = "Deployment";
    }

    info = Object.assign({}, info, params);
  } catch {
    info = Object.assign({}, DEFAULT_PLAYER_INFO, params);
  }

  if(info.deck) {
    info.deckData = new DeckDecoder(info.deck);
  }

  await save(info.id, info);

  return info;
}

const saveBannedInfo = async function(params) {
  let info = null;
  
  try {
    info = await db.get(params.id);
    info = JSON.parse(info);
  } catch {
    info = {id: params.id, name: "Unknown", level: 1};
  }

  logger.info("Player " + info.id + ":" + info.name + " has been " + (params.banned ? "banned" : "unban"));

  let idx = global.bannedList.findIndex((item) => item.id == params.id);

  let reason = params.reason || '';

  if(idx > -1) {
    let old = global.bannedList.splice(idx, 1);
    reason = old[0].reason || reason;
  }
  
  let time = parseFloat(params.time);

  if(isNaN(time)) {
    time = 0;
  } else {
    time = parseInt(time * 3600000);
  }
 
  let now = Date.now();

  if(params.banned) {
    info.time = time > 0 ? now + time: 0;
    info.host = params.host;
    info.reason = reason;
    global.bannedList.push(info);
  }

  // Remove players whose ban time has expired
  global.bannedList.filter(x => x.time > 0 && x.time - now <= 0).forEach(x => global.bannedList.splice(global.bannedList.indexOf(x), 1));
  
  await save("banned", global.bannedList);

  if(!global.timer[`unban_${info.id}`] && time > 0 && time < 60000) {
    global.timer[`unban_${info.id}`] = setTimeout(async () => {
      await saveBannedInfo({id: info.id, banned: false, broadcast: true});
    }, time);
  }

  if(!params.broadcast) {
    return;
  }

  io.sockets.emit("update-banned-list", {data: global.bannedList});
}

const saveServerVariable = async function(params) {
  if(!global.cache[params.host]) {
    return;
  }

  let info = null;

  try {
    info = await db.get(params.host + "-variable");
    info = JSON.parse(info);
  } catch {
    info = {};
  }

  let prev = Object.assign({}, info);

  info[params.key] = params.value;

  global.cache[params.host].variable = info;

  if(prev[params.key] == info[params.key]) {
    return;
  }
  
  io.to(params.host).emit("update-variable", params);

  await save(params.host + "-variable", info);
}

const saveServerInfo = async function(params) {
  let info = null;
  
  try {
    info = await db.get("hosts");
    info = JSON.parse(info);
  } catch {
    info = {};
  }

  info[params.host] = params.password;

  save("hosts", info);
}

const fetchServerInfo = async function() {
  let info = null;
  
  try {
    info = await db.get("hosts");
    info = JSON.parse(info);
  } catch {
    info = {};
  }

  return info;
}

const saveRotationList = async function(params) {
  if(!global.cache[params.host]) {
    return;
  }

  global.cache[params.host].rotationList = params.data;

  await save(params.host + "-rotation", params.data);
  
  io.to(params.host).emit("update-rotation-list", {id: params.id, host: params.host, items: params.data});
}

const saveRestrict = async function(id, host, args) {
  if(!global.cache[host]) {
    return;
  }

  let restrict = await fetchRestrict(host);
  
  restrict = Object.assign({}, restrict, args);

  await save(host + "-restrict", restrict)

  global.cache[host].restrict = restrict;

  io.to(host).emit("update-restrict", {id: id, host: host, value: restrict});
}

const saveRotationStatus = async function(id, host, status) {
  if(!global.cache[host]) {
    return;
  }

  global.cache[host].rotation = status;
  
  await save(host + "-auto-rotation", status);
  
  io.to(host).emit("update-rotation-status", {id: id, host: host, value: status});
}

const fetchRestrict = async function(host) {
  let restrict = await fetchData(host, "restrict", {deck: -1, blue: '', red: '', min: 0, max: 0, nation: DEFAULT_RESTRICT_NATION_VALUE});

  if(restrict.nation) {
    return restrict;
  }

  restrict.nation = DEFAULT_RESTRICT_NATION_VALUE;

  return restrict;
}

const fetchRotationStatus = async function(host) {
  return await fetchData(host, "auto-rotation", false);
}

const fetchData = async function(host, suffix, defaultValue) {
  let info = null;
  
  try {
    info = await db.get(host + "-" + suffix);
    info = JSON.parse(info);
  } catch {
    info = defaultValue;
  }

  return info;
}

const fetchReplacement = async function() {
  try {
    let data = await db.get('replacement');
    return JSON.parse(data);
  } catch {
    return {source: [], target: []};
  }
}

const fetchServerVariable = async function(host) {
  return await fetchData(host, "variable", {});
}

const fetchRotationList = async function(host) {
  return await fetchData(host, "rotation", []);
}

const fetchPlayerList = async function(host) {
  return await fetchData(host, "player", []);
}

const fetchBannedList = async function() {
  let list = null;

  try {
    list = await db.get("banned");
    list = JSON.parse(list);;
  } catch {
    list = [];
  }

  let now = Date.now();
  
  let result = [];

  for(let item of list) {
    if(item.time && item.time <= now) {
      await saveBannedInfo({id: item.id, banned: false});
    } else {
      result.push(item);
    }
  }

  return result;
}

const checkBannedInfo = async function(host, player) {
  let info = global.bannedList.filter(item => item.id == player.id);

  if(!(info && info.length)) {
    // pass
    return;
  }

  if(info.time > 0 && info.time - Date.now() <= 0) {
    // unban and pass
    await saveBannedInfo({id: player.id, banned: false, broadcast: true});
    return;
  }

  // Using kick to simulate ban can avoid the problem of unban failure
  global.cache[host].rcon.send(`kick ${player.id}`);
}

const replace = async function(host, params) {
  for(let item of replacement.source) {
    if(params.name.toLowerCase().indexOf(item) > -1) {
      let newName = replacement.target[Math.floor(Math.random() * replacement.target.length)]
      setTimeout(() => { 
        savePlayerInfo(host, {id: params.id, name: newName});
        global.cache[host].rcon.send(`setpvar ${params.id} PlayerName ${newName}`); 
      }, 300);
      setTimeout(() => { broadcastPlayerList(host); }, 1000);
      return;
    }
  }
}

const onPlayerConnect = async function(host, params) {
  let id = params[1];
  let ip = params[2];
  
  let geo = geoip.lookup(ip);
  
  let player = {id: id, ip: ip, status: 'Waiting', alliance: 0, connected: false};

  if(geo) {
    player.country = geo.country;
    player.city = geo.city;
    player.timezone = geo.timezone;
  }
  
  await savePlayerInfo(host, player);

  checkBannedInfo(host, player);
}

const onPlayerDisconnect = async function(host, params) {
  saveHostPlayers(host, params[1], false, null);
  //fetchRemotePlayerList(host);

  await savePlayerInfo(host, {id: params[1], status: false});
}

const onSetPlayerDeck = async function(host, params) {
  let str = params[2];
  let deck = new DeckDecoder(str);
  let restrict = global.cache[host].restrict;

  let player = await fetchPlayerInfo({id: params[1], name: 'Unknown'});
  
  let alliance = player.alliance;
  
  if(alliance == undefined || alliance == null) {
    alliance = fetchPlayerAllianceFromCache(host, params[1]);
  }

  if(alliance == -1) {
    alliance = deck.side;
  }

  if(alliance == undefined || alliance == null || alliance == -1) {
    return;
  }

  let defaultType = ['BLUFOR', 'REDFOR'][alliance];

  alliance = ['blue', 'red'][alliance];

  if(restrict) {
    if(restrict.deck >= 0 && deck.spec == restrict.deck) {
  
      str = restrict[alliance];
  
      if(str && str.trim().length){
        global.cache[host].rcon.send(`setpvar ${params[1]} PlayerDeckContent ${str}`);
      }
    }

    if(restrict.nation[alliance].type != defaultType && restrict.nation[alliance].deck.trim().length > 0 && deck.nation != restrict.nation[alliance].type) {
      str = restrict.nation[alliance].deck;

      if(str && str.trim().length){
        global.cache[host].rcon.send(`setpvar ${params[1]} PlayerDeckContent ${str}`);
      }
    }
  }

  //saveHostPlayers(host, params[1], true, null);

  await savePlayerInfo(host, {id: params[1], deck: str, connected: true});
  
  //fetchRemotePlayerList(host);
  broadcastPlayerList(host);
}

const onSetPlayerDeckName = async function(host, params) {
  await savePlayerInfo(host, {id: params[1], deckName: params[2]});
  broadcastPlayerList(host);
}

const onSetPlayerLevel = async function(host, params) {
  await savePlayerInfo(host, {id: params[1], level: params[2]});

  if(!global.cache[host]) {
    return;
  }

  let restrict = global.cache[host].restrict;
  let level = params[2];
  
  if(!((restrict.min == null || restrict.min == 0 || level >= restrict.min) && (restrict.max == null || restrict.max == 0 || level <= restrict.max))) {

    let msg = "";

    if(restrict.min > 0 && restrict.max == 0) {
      msg = `this server only allows players higher than ${restrict.min} level to enter`;
    } else if(restrict.min == 0 && restrict.max > 0) {
      msg = `this server only allows players below ${restrict.max} level to enter`;
    } else {
      msg = `this server only allows players with levels between ${restrict.min} and ${restrict.max} to enter`;
    }

    chat(host, msg);

    global.cache[host].rcon.send(`kick ${params[1]}`);
  }
}

const onSetPlayerElo = async function(host, params) {
  await savePlayerInfo(host, {id: params[1], elo: params[2]});
}

const onSetPlayerAlliance = async function(host, params) {
  saveHostPlayers(host, params[1], true, params[2]);
  await savePlayerInfo(host, {id: params[1], alliance: params[2]});
}

const onSetPlayerAvatar = async function(host, params) {
  let player = await fetchPlayerInfo({id: params[1]});

  if(!config.steamApiKey || !config.steamApiKey.length || config.steamApiKey == 'YOUR_STEAM_WEB_API_KEY') {
    return;
  }

  if((player.steam && player.steam.next < Date.now()) || params[2].length < 42) {
    return;
  }

  try {
    let array = params[2].split('/');
    
    if(array.length != 3) {
      return;
    }

    const res = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steamApiKey}&steamids=${array[2]}`);

    if(!(res.data && res.data.response && res.data.response.players && res.data.response.players.length > 0)) {
      return;
    }

    let item = res.data.response.players[0];
    let steam = {name: item.personaname, avatar: item.avatar, profile: item.profileurl, country: item.loccountrycode, next: Date.now() + 86400000};

    await savePlayerInfo(host, {id: player.id, steam: steam});
  } catch (error) {}
}

const onSetPlayerName = async function(host, params) {
  saveHostPlayers(host, params[1], true, null);
  let data = {id: params[1], name: params[2]};
  replace(host, data);
  await savePlayerInfo(host, data);
}

const onChangePlayerStatus = async function(host, params) {
  let status = false;

  switch(params[2]) {
    case "51":
      status = "Loading";
      break;
    case "52":
      status = "Ready";
      break;
    case "53":
      status = "Battle";
      break;
    case "101":
      status = "End";
      break;
    case "0":
      status = "Waiting";
      break;
    default:
      status = false;
  }

  if(!status) {
    return;
  }

  if(!global.cache[host].loaded) {
    global.cache[host].loaded = [];
  }

  if(params[2] == "52") {
    global.cache[host].loaded.push(params[1]);
  }

  await savePlayerInfo(host, {id: params[1], status: status});

  broadcastPlayerList(host);
}

const onPlayerReady = async function(host, params) {
  await savePlayerInfo(host, {id: params[1], status: "Deployment"});
  
  broadcastPlayerList(host);
}

const onPlayerBanned = async function(host, params) {
  let time = params[2] * 1;
  await saveBannedInfo({id: params[1], time: time ? Date.now() + (time * 3600000) : 0, banned: true, host: host, broadcast: true});
}

const onPlayerUnban = async function(host, params) {
  await saveBannedInfo({id: params[1], banned: false, broadcast: true});
}

const onLaunch = async function(host) {
  updateServerState(host, 'Countdown');
  
  if(global.motd[host]) {
    clearTimeout(global.motd[host]);
    global.motd[host] = null;
  }

  global.motd[host] = setTimeout(() => { broadcastMOTD(host); }, 2000);
  
  setTimeout(async () => {
    for(let x of global.cache[host].players) {
      let player = await fetchPlayerInfo({id: x.id});
  
      if(!player.connected) {
        commandHandler({host: host, cmd: `kick ${player.id}`});
      }
    }
  }, 1000);
  
}

const onCancelLaunch = async function(host) {
  updateServerState(host, 'Waiting for players', 0);
  
  if(global.motd[host]) {
    clearTimeout(global.motd[host]);
    global.motd[host] = null;
  }
}

const onEnterLobby = function(host, params) {
  updateServerState(host, 'Waiting for players', 0);
}

const onGameLoading = function(host, params) {
  global.cache[host].loaded = [];

  updateServerState(host, 'Loading');
  broadcastPlayerList(host);
}

const onGameDeployment = function(host, params) {
  if(global.cache[host].loaded) {
    global.cache[host].players
    .filter(x => !global.cache[host].loaded.includes(x.id))
    .forEach(x => {
      global.cache[host].players.splice(global.cache[host].players.findIndex(v => v.id == x.id), 1);
    });
    
    let array = global.cache[host].players.map(x => x.id);
    
    global.cache[host].loaded
    .filter(x => !array.includes(x))
    .forEach(x => {
      global.cache[host].players.push({id: x});
    });
    
    global.cache[host].loaded = null;
    delete global.cache[host].loaded;
  }

  updateServerState(host, 'Deploying');
  broadcastPlayerList(host);
}

const onGameStart = function(host, params) {
  updateServerState(host, 'Game in progress');
}

const onGameDebriefing = async function(host, params) {
  updateServerState(host, 'Debriefing');

  if(global.motd[host]) {
    clearTimeout(global.motd[host]);
  }

  if(!global.init[host]) {
    return;
  }

  let status = await fetchRotationStatus(host);

  if(!status) {
    return;
  }

  let list = await fetchRotationList(host);

  if(!global.map[host]) {
    global.map[host] = [];
  }

  if(list && list.length > 1) {
    let flag = true;
    let map = null;
    let count = 0;

    while(flag && count < 5) {
      let idx = Math.round(Math.random()*(list.length-1));
      map = list[idx];

      if(global.map[host].indexOf(map) == -1) {
        flag = false;
      }

      count++;
    }

    let settings = await fetchServerVariable(host);

    let prefix = settings.VictoryCond == 4 ? 'Conquete' : 'Destruction';

    await saveServerVariable({host: host, key: 'Map', value: map});

    commandHandler({host: host, cmd: `setsvar Map ${prefix}_${map}`});
  }
}

const onSetServerVariables = async function(host, params) {
  let key = params[1];
  let value = params[2];

  if(key == "Map") {
    value = value.replace(/Destruction_|Conquete_/g,"");
    
    if(!global.map[host]) {
      global.map[host] = [];
    }

    if(global.map[host].length > 2) {
      global.map[host].splice(0, 1);
    }

    global.map[host].push(value);
  } else if(key == "TimeLimit") {
    value = value / 60;
  }

  await saveServerVariable({host: host, key: key, value: value}); 
}

const events = [
  {regex: /Client added in session \(EugNetId : ([0-9]+).+ IP : ([\d.]+)/, handler: onPlayerConnect},
  {regex: /Client ([0-9]+) variable PlayerDeckContent set to "(.*)"/, handler: onSetPlayerDeck},
  {regex: /Client ([0-9]+) variable PlayerDeckName set to "(.*)"/, handler: onSetPlayerDeckName},
  {regex: /Client ([0-9]+) variable PlayerLevel set to "(.*)"/, handler: onSetPlayerLevel},
  {regex: /Client ([0-9]+) variable PlayerElo set to "(.*)"/, handler: onSetPlayerElo},
  {regex: /Client ([0-9]+) variable PlayerAlliance set to "([0-9])"/, handler: onSetPlayerAlliance},
  {regex: /Client ([0-9]+) variable PlayerAvatar set to "(.*)"/, handler: onSetPlayerAvatar},
  {regex: /Client ([0-9]+) variable PlayerName set to "(.*)"/, handler: onSetPlayerName},
  {regex: /Client ([0-9]+) variable PlayerReady set to "0"/, handler: onPlayerReady},
  {regex: /Client ([0-9]+) set request state to ([0-9]+)/, handler: onChangePlayerStatus},
  {regex: /Disconnecting client ([0-9]+)/, handler: onPlayerDisconnect},
  {regex: /Entering in loading phase state/, handler: onGameLoading},
  {regex: /Entering in deploiement phase state/, handler: onGameDeployment},
  {regex: /Entering in command phase state/, handler: onGameStart},
  {regex: /Entering in debriephing phase state/, handler: onGameDebriefing},
  {regex: /Entering in matchmaking state/, handler: onEnterLobby},
  {regex: /RCon request command : ban (\d+) (\d+)/, handler: onPlayerBanned},
  {regex: /RCon request command : unban (\d+)/, handler: onPlayerUnban},
  {regex: /RCon request command : setsvar (\w+) (.*)/, handler: onSetServerVariables},
  {regex: /Launch game/, handler: onLaunch},
  {regex: /Canceling launch game/, handler: onCancelLaunch}
];

const eventHandler = async function(host, data) {
  for(let event of events) {
    let m = event.regex.exec(data);

    if(m && m.length >= 1) {
      await log('log', host, data);
      await event.handler.apply(this, [host, m]);
      return;
    }
  }
}

const loadLog = async function(host, dir) {
  const stream = fs.createReadStream(dir + '/serverlog.txt');
  
  const readLine = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });
  
  for await (const line of readLine) {
    await eventHandler(host, line);
  }
}

const init = async function() {
  for(let key in config.hosts) {
    if(!global.log[key]) {
      global.log[key] = [];
      global.message[key] = [];
    }

    //await loadLog(key, config.hosts[key]);
    global.init[key] = true;

    await tail('log', key);
    await tail('message', key);
    
    setTimeout(() => {
      processQueue(key);
    }, 1000);
  }
  
  global.init.done = true;

  global.bannedList = await fetchBannedList();

  let list = await fetchServerInfo();

  for(let key in list) {
    loginHandler({host: key, password: list[key]});
  
    if(!global.cache[key]) {
      continue;
    }

    global.cache[key].variable = await fetchServerVariable(key);
    global.cache[key].rotation = await fetchRotationStatus(key);
    global.cache[key].rotationList = await fetchRotationList(key);
  }

  global.replacement = await fetchReplacement();

  setTimeout(downloadBannedList, 300000);

  global.timer.checkBannedList = setInterval(checkBannedList, 60000);
}

const downloadBannedList = async function() {
  if(config.globalBan) {
    try {
      let res = await axios.get(`${config.globalBanUrl}/ban`);

      if(res.data) {
        let flag = false;

        for(let n of res.data) {
          if(global.bannedList.find(x => x.id == n.id)) {
            continue;
          }

          global.bannedList.push(n);
          flag = true;
        }

        if(flag) {
          save("banned", global.bannedList);
        }
      }
    } catch {}

    // Synchronize the banned list every 5 minutes
    setTimeout(downloadBannedList, 300000);
  }
}

// Check if there are players who need to unban in the 1 min
const checkBannedList = async function() {
  if(global.bannedList) {
    let now = Date.now();
    
    let unbanList = global.bannedList.filter(x => x.time > 0 && x.time - now <= 60000);

    let manualBroadcast = false;

    unbanList.forEach(async x => {
      let gap = x.time - now;

      if(gap > 60000) {
        return;
      }

      if(gap <= 0) {
        await saveBannedInfo({id: x.id, banned: false, broadcast: false});
        manualBroadcast = true;
        return;
      }

      if(global.timer[`unban_${x.id}`]) {
        return;
      }

      global.timer[`unban_${x.id}`] = setTimeout(async () => {
        await saveBannedInfo({id: x.id, banned: false, broadcast: true});
      }, gap);
    });

    if(manualBroadcast) {
      io.sockets.emit("update-banned-list", {data: global.bannedList});
    }
  }
}

const tail = async function(type, host) {
  let filename = `${config.hosts[host]}/${type == "log" ? "serverlog.txt" : "chat.log"}`;

  fs.access(filename, fs.constants.F_OK, async (err) => {
    if(!err) {
      global[type].tail[host] = new Tail(filename);

      global[type].tail[host].on("line", async (data) => {
        queue(type, host, data);
      })
    }
  });
}

const processQueue = async function(host) {
  while(true) {
    if(global.queue.log[host] && global.queue.log[host].length) {
      let data = global.queue.log[host].shift();
      await eventHandler(host, data);
    }
    
    if(global.queue.message[host] && global.queue.message[host].length) {
      let data = global.queue.message[host].shift();
      
      await log('message', host, data);
    }

    await wait(50);
  }
}

const queue = function(type, host, line) {
  if(!global.queue[type][host]) {
    global.queue[type][host] = [];
  }

  global.queue[type][host].push(line);
}

const commands = [
  {regex: /setdeck\s(@.+)/i, handler: setPlayerDeck}
];

const log = async function(type, host, line) {
  let data = line;

  if(type == 'message') {
    let m = /\[(\d+)\] (\d+): (.*)/.exec(line);

    if(!(m && m.length > 1)) {
      return;
    }

    let player = await fetchPlayerInfo({id: m[2]});

    data = {time: m[1] * 1000, id: m[2], name: player.name, message: m[3]};

    for(let idx = 0; idx<3 && idx<global[type][host].length; idx++) {
      let item = global[type][host][idx];
      if(item.time == data.time && item.message == data.message && item.id == data.id && item.name == data.name) {
        return;
      }
    }
    
    // check if it is a chat command
    if(config.enableChatCommand) {
      for(let command of commands) {
        let m = command.regex.exec(data.message);
    
        if(m && m.length >= 1) {
          await command.handler.apply(this, [host, data.id, m[1]]);
          break;
        }
      }
    }
  }

  if(global[type][host].length >= 300) {
    global[type][host].splice(299);
  }

  global[type][host].unshift(data);

  io.to(host).emit('update-' + type, {host: host, item: data});
}

const wait = async function (ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
};

init();

http.listen(port, function(){
  logger.info('listening on *:' + port);
});