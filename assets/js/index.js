Vue.use(Toasted);

new Vue({
  el: "#app",
  data: {
    mapping: {
      maps: {
        // 1vs1
        "2x3_Esashi":{name: "Tropic Thunder", mode: 1},
        "2x3_Gangjin":{name: "Mud fight !", mode: 1},    
        "2x3_Hwaseong":{name: "Nuclear winter is coming", mode: 1},
        "2x2_port_Wonsan_Terrestre":{name: "Wonsan harbour", mode: 1},
        "3x3_Muju":{name: "Plunjing Valley", mode: 1},
        "2x3_Montagne_1":{name: "Death Row", mode: 1},
        "2x3_Tohoku_Alt":{name: "Paddy Field", mode: 1},
        "3x3_Muju_Alt":{name: "Punchbowl", mode: 1},
        "3x3_Marine_3_Reduite_Terrestre":{name: "Hell in a very small place", mode: 1},
        "5x3_Marine_1_small_Terrestre":{name: "Strait to the point (small)", mode: 1},
        "2x2_port_Wonsan":{name: "Wonsan harbour", mode: 1, water: 2},
        "4x4_Marine_6":{name: "Out of the blue", mode: 1, water: 1},
        "4x4_Marine_7":{name: "Standoff in Barents", mode: 1, water: 1},
            
        // 2vs2
        "2x3_Boseong":{name: "Apocalipse Imminent", mode: 2},
        "2x3_Tohoku":{name: "Paddy Field", mode: 2},
        "2x3_Anbyon":{name: "Hop and Glory", mode: 2},
        "3x2_Montagne_3":{name: "Chosin Reservoir", mode: 2},
        "3x2_Taebuko":{name: "Jungle LAW", mode: 2},
        "3x2_Haenam_Alt":{name: "Operation Chromite", mode: 2},
        "3x3_Highway_Small":{name: "Highway to Seoul", mode: 2},
        "3x2_Boryeong_Terrestre":{name: "Gunboat diplomacy", mode: 2},
        "3x3_Marine_3_Terrestre":{name: "Another D-Day in paradise ", mode: 2},
        "5x3_Marine_1_small":{name: "Strait to the point (small)", mode: 2, water: 2},
        "4x4_Marine_10":{name: "Alea Jacta West", mode: 2, water: 1},
        "4x4_Marine_9":{name: "Bulldogs and Vampires", mode: 2, water: 1},
            
        // 3vs3    
        "3x2_Sangju":{name: "Tough Jungle", mode: 3},
        "Chongju_Alt":{name: "Wrecks and Rocks", mode: 3},
        "3x2_Taean":{name: "Bloody Ridge", mode: 3},
        "2x3_Montagne_2":{name: "Cliff Hanger", mode: 3}, 
        "3x2_Haenam":{name: "Back to Inchon", mode: 3},
        "5x3_Marine_1_Terrestre":{name: "Strait to the point", mode: 3},
        "3x3_Pyeongtaek_Alt":{name: "38th Perpendicular", mode: 3},
        "3x3_Highway":{name: "Highway to Seoul", mode: 3},
        "3x3_Thuringer_Wald":{name: "Snake Pit", mode: 3},
        "3x3_Thuringer_Wald_Alt":{name: "Crossroad", mode: 3},
        "3x2_Boryeong":{name: "Gunboat Diplomacy", mode: 3, water: 2},
        "3x3_Marine_3":{name: "Another D-Day in Paradise", mode: 3, water: 2},
        "4x4_Marine_4":{name: "Atoll Inbound", mode: 3, water: 1},
        "4x4_Marine_5":{name: "Waterworld", mode: 3, water: 1},
            
        //4vs4
        "4x3_Sangju_Alt":{name: "The Green Mile", mode: 4},
        "5x3_Marine_1_Alt":{name: "Battle of Yuchalnok Pass", mode: 4},
        "3x3_Pyeongtaek":{name: "38th Parallel", mode: 4},
        "3x3_Montagne_4":{name: "A Maze in Japan", mode: 4},
        "3x3_Chongju":{name: "Korean Rocks", mode: 4},
        "3x3_Montagne_1":{name: "Cold War Z", mode: 4},
        "3x3_Gangjin":{name: "Floods", mode: 4},
        "4x4_ThreeMileIsland":{name: "Sun of Juche", mode: 4},
        "4x4_ThreeMileIsland_Alt":{name: "Final Meltdown", mode: 4},
        "4x3_Gjoll":{name: "Heartbreak Ridge", mode: 4},
        "3x3_Asgard":{name: "The Crown of Crags", mode: 4},
        "5x3_Marine_1":{name: "Strait to the point", mode: 4, water: 2},
        "3x3_Marine_2":{name: "Smoke in the water", mode: 4, water: 2},
            
        //10vs10
        "5x3_Asgard_10v10":{name: "Asgard", mode: 10},
        "5x3_Gjoll_10v10":{name: "Gjoll", mode: 10},
        "4x4_Russian_Roulette":{name: "Russian Roulette", mode: 10}
      },
      gameMode: {
        1: "Destruction",
        2: "Siege",
        3: "Economy",
        4: "Conquest"
      },
      gameType: {
        0: "NATO vs PACT",
        1: "NATO vs NATO",
        2: "PACT vs PACT"
      },
      incomeRate: {
        0: "None",
        1: "Very low",
        2: "Low",
        3: "Medium",
        4: "High",
        5: "Very High"
      },
      thematic: {
        "-1": "None",
        "-2": "Any",
        "0": "Motorised",
        "1": "Armored",
        "2": "Support",
        "3": "Marine",
        "4": "Mecanized",
        "5": "Airborne",
        "6": "Naval"
      },
      thematicSeq: [-1, -2, 0, 1, 2, 3, 4, 5, 6],
      date: {
        "-1": "None",
        "0": "Post-85",
        "1": "Post-80"
      },
      dateSeq: [-1, 0, 1],
      nation: {
        "-1": "None",
        "0": "Nations and coalitions",
        "1": "Nations only",
        "2": "Coalitions only"
      },
      nationSeq: [-1, 0, 1, 2],
      nationCode: {
        blue: ["BLUFOR","US","UK","FRA","RFA","CAN","DAN","SWE","NOR","ANZ","JAP","ROK","HOL","ISR","SA","EURO","SCAND","CMW","BLUEDRAGONS","LAND","NORAD","NLGR"],
        red: ["REDFOR","RDA","USSR","POL","FIN","YUG","CZ","CHI","NK","NSWP","REDDRAGONS","FINPOL","YUGVAK"]
      },
      restrict: [-1, 0, 1, 2, 3, 4, 5],
      time: {
        "1": "1 Hour",
        "12": "12 Hours",
        "24": "1 Day",
        "72": "3 Days",
        "168": "1 Weeks",
        "336": "2 Weeks",
        "720": "1 Months",
        "1440": "2 Months",
        "2160": "3 Months",
        "4320": "6 Months",
        "0": "Permanent"
      }
    },
    presets: {},
    current: {},
    default: {
      name: "Default",
      autoRotation: false,
      server: {
        host: "1.2.3.4:1234",
        password: "123456"
      },
      motd: "",
      settings: {
        ServerName: "New Wargame Server",
        Password: "",
        VictoryCond: 1,
        GameType: 0,
        Map: "3x3_Marine_3",
        Private: 0,
        InitMoney: 11000,
        ScoreLimit: 23000,
        TimeLimit: 60,
        IncomeRate: 4,
        NbMinPlayer: 20,
        NbMaxPlayer: 20,
        WarmupCountdown: 10,
        DeploiementTimeMax: 180,
        LoadingTimeMax: 60,
        DebriefingTimeMax: 90,
        DeltaMaxTeamSize: 10,
        MaxTeamSize: 10,
        ThematicConstraint: -1,
        NationConstraint: -1,
        DateConstraint: -1
      },
      restrict: {
        deck: -1,
        blue: '',
        red: '',
        level: 0,
        min: 0,
        max: 0,
        nation: {
          blue: {type: 'BLUFOR', deck: ''},
          red: {type: 'REDFOR', deck: ''}
        }
      },
      version: 2
    },
    id: 0,
    name: "Default",
    info: {
      create: false,
      connected: false,
      playerList: [],
      bannedList: [],
      rotationList: [],
      logs: [],
      messages: [],
      state: 'Unknown',
      show: 1,
      current: {},
      name: '',
      showDeck: null,
      showBan: null,
      showDeckRestrict: false,
      showLevelRestrict: false,
      showNationRestrict: false,
      showRestrict: false,
      showLogs: 1,
      showMotd: false,
      import: null,
      presets: '',
      banTime: 24,
      focus: null,
      manualCommand: null,
      countdown: 0,
      time: '',
      mute: false,
      mode: 1
    },
    timer: {
      countdown: null,
      command: null,
      refresh: null,
      other: null
    },
    style: "background: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('/assets/img/bg/0.jpg');",
    toastConfig: { theme: 'outline', position: 'bottom-right', duration: 2000 },
    id: null,
    socket: null,
    prev: null,
    voiceConfig: null,
    voicePresets: null,
    sound: new Audio("data:audio/wav;base64,//tQxAAAB9yXNXQTAAHDKWo7HtAAIAJcAABgzGN5jY/H/neydsTJ3v//u7vf///4IEEDwAEZZO/EJ3rREeyBCAxu6P8HAQh+D4Pg+H9YP/Ln//w/URUvU0quBmjOADHXH0nQJSQt9iqIorGAvrJGS1YDxgPBRdYwLxNJApxlhfkgCGG4gluim81m3GHGspViAhPuJOIVJ1GRA9RG84QetGur/2rWerOspS0k6jFl0lJUiaaIJaLK1a7//V7fXfOGfxBb6nK+7f2tWgSKWQdsMP/7UsQFgAu1ZVu89oAReJlp/MaK3BAKsY6zCQ5dySoKeZvlKCnSsTR6gjBqiy1rWnY6SSmPs/+iYpk51f8iDuHaixxi+hoL1bbPts/b9dSZr/uj7X1ba+vqXTo0du1N97NVRXnzVjdb08xOTCDKQKpJbngUBq+RjgjqyShodC7Dhzj9H5vg8ABuf2w2p82simzX+gxJiTk0sXb/cZhTTpvQ+QZF5zmZX7QgvJAmKBULFVicFwSe9VtQ4sOwMW8tURqehN9Qmpc9dfAkEW5JT/Kw//tSxAWACzFjV6Y0U1l9rKn8yBZpVlZD1EeKTNVLLbJ0TzsR7snLCCRP1VmBKUP/1lZgALZeNmR/RjuZJ6kG+jF/t64ZjJoQ7HCCXVGuqJOUptr/3ITvb//O/mTrQIHZpf/AyLnJm4lhcAMc1LDyckAzdDgDQhnxFSNHo0jzpZRVNmnlsQWB+pu7VLrTC/ALCKbJt/zMtEIJQf/5kfTdxnEVXX9X+ldNFf1kU4O2dtb6uSjf9U+3btqulNnXyRcIjxIBrbqrq6IYwRbuxssBqCb/+1LEBwAMLWdX9MaAAXeaLXcW0AIRIx/IA7OCZR/VZUOjse7sXtZmLarWggkS4GoHwuN/+odiIiih/+aaAuNb0f/666SCDabJso8LdNNq0aqqZmtd3//60zjMyq169abnVqVQ7V1n3XcPh8LBEGRIIR4IxYHAsWOV9wMk2fHghjUq8hj3k7E9DhOGXy+JKbzFJ/rOA0E0sLzmVvn6QXkDyGR1Io/hegsCRHmPdNA0MTVLX/WpRgUi5qLfzM6QMKQ3/6fKpIsVAAAAHH/AH+v/6v/7UsQFA8OoAPm8AYAgAAA0gAAABPDS3dH///+n//DSj3EX+hZ3//oVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV")
  },
  created: function() {
    var presets = localStorage.getItem("presets_v2");
    var name = localStorage.getItem("name");

    if(!name) {
      name = "Default";
    }
    
    try {
      presets = JSON.parse(presets);

      if(!presets) {
        throw "presets not found";
      }
      
      presets = this.check(presets);
    } catch {
      presets = {"Default": this.default};
      name = this.default.name;
    }

    var id = localStorage.getItem("id");

    if(!id) {
      id = Date.now();
      localStorage.setItem("id", id);
    }

    if(localStorage.getItem("mute")) {
      this.info.mute = true;
    }

    this.id = id;
    this.presets = presets;
    this.name = name;
    
    this.current = presets[name];

    if(!this.current) {
      for (const key in presets) {
        this.current = presets[key];
        this.name = this.current.name;
        break;
      }
    }
    
    this.prev = this.current.server.host;

    if(!this.current.restrict) {
      this.current.restrict = this.default.restrict;
    }

    if(!this.current.motd) {
      this.current.motd = "";
    }
    
    localStorage.setItem("presets_v2", JSON.stringify(presets));
    localStorage.setItem("name", name);

    this.voicePresets = window.speechSynthesis.getVoices();
    this.voiceConfig = new SpeechSynthesisUtterance();
    this.voiceConfig.voice = this.voicePresets[1]; // 
    this.voiceConfig.voiceURI = 'native';
    this.voiceConfig.volume = 1; // 0 to 1
    this.voiceConfig.rate = 1; // 0.1 to 10
    this.voiceConfig.pitch = 2; //0 to 2
    this.voiceConfig.text = '';
    this.voiceConfig.lang = 'en';

    window.socket = this.socket = io();

    this.socket.io.on('reconnect_attempt', function(e) {
      console.log('socket reconnecting ...');
    });

    this.socket.io.on('reconnect_error', function(e) {
      console.log(e);
      console.log('socket reconnect error');
    });

    this.socket.io.on('reconnect_failed', function(e) {
      console.log(e);
      console.log('socket reconnect failed');
    });

    this.socket.io.on('reconnect', this.connect);

    this.socket.on('connect', this.connect);

    this.style = "background: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('/assets/img/bg/" + Math.floor(Math.random()*51) + ".jpg');"
  },
  filters: {
    formatter: function(value) {
      if(!value) {
        return "Permanent";
      }

      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  watch: {
    "current.autoRotation": function(current, prev) { current != prev && this.setAutoRotation() },
    "current.server.host": function(current, prev) { current != prev && this.saveSetting() },
    "current.server.password": function(current, prev) { current != prev && this.saveSetting() },
    "current.settings.ServerName": function(current, prev) { current != prev && this.saveSetting("ServerName") },
    "current.settings.Password": function(current, prev) { current != prev && this.saveSetting("Password") },
    "current.settings.VictoryCond": function(current, prev) { current != prev && this.saveSetting("VictoryCond") },
    "current.settings.GameType": function(current, prev) { current != prev && this.saveSetting("GameType") },
    "current.settings.Map": function(current, prev) { current != prev && this.saveSetting("Map") },
    "current.settings.Private": function(current, prev) { current != prev && this.saveSetting("Private") },
    "current.settings.InitMoney": function(current, prev) { current != prev && this.saveSetting("InitMoney") },
    "current.settings.ScoreLimit": function(current, prev) { current != prev && this.saveSetting("ScoreLimit") },
    "current.settings.TimeLimit": function(current, prev) { current != prev && this.saveSetting("TimeLimit") },
    "current.settings.IncomeRate": function(current, prev) { current != prev && this.saveSetting("IncomeRate") },
    "current.settings.NbMinPlayer": function(current, prev) { current != prev && this.saveSetting("NbMinPlayer") },
    "current.settings.WarmupCountdown": function(current, prev) { current != prev && this.saveSetting("WarmupCountdown") },
    "current.settings.DeploiementTimeMax": function(current, prev) { current != prev && this.saveSetting("DeploiementTimeMax") },
    "current.settings.LoadingTimeMax": function(current, prev) { current != prev && this.saveSetting("LoadingTimeMax") },
    "current.settings.DebriefingTimeMax": function(current, prev) { current != prev && this.saveSetting("DebriefingTimeMax") },
    "current.settings.DeltaMaxTeamSize": function(current, prev) { current != prev && this.saveSetting("DeltaMaxTeamSize") },
    "current.settings.MaxTeamSize": function(current, prev) { current != prev && this.saveSetting("MaxTeamSize") },
    "current.settings.ThematicConstraint": function(current, prev) { current != prev && this.saveSetting("ThematicConstraint") },
    "current.settings.NationConstraint": function(current, prev) { current != prev && this.saveSetting("NationConstraint") },
    "current.settings.DateConstraint": function(current, prev) { current != prev && this.saveSetting("DateConstraint") }
  },
  methods: {
    toast: function(text) {
      this.$toasted.show(text, this.toastConfig);
    },
    // build the common request header
    buildRequestParams: function(args) {
      let val = {id: this.id, host: this.current.server.host, password: this.current.server.password};

      if(args) {
        val = Object.assign({}, val, args);
      }

      return val;
    },
    // wargame server login result event
    onLoginResponse: function(data) {
      if(data) {
        this.socket.removeAllListeners();
        this.socket.offAny();
        
        this.socket.off("update-variable", this.onUpdateVariable);
        this.socket.off("update-player-list", this.onUpdatePlayerList);
        this.socket.off("update-banned-list", this.onUpdateBannedList);
        this.socket.off("update-rotation-status", this.onUpdateRotationStatus);
        this.socket.off("update-rotation-list", this.onUpdateRotationList);
        this.socket.off("update-restrict", this.onUpdateRestrict);
        this.socket.off("update-log", this.onUpdateLogs);
        this.socket.off("update-state", this.onUpdateState);

        this.socket.once("update-server-info", this.onUpdateServerInfo);

        this.socket.on("update-variable", this.onUpdateVariable);
        this.socket.on("update-player-list", this.onUpdatePlayerList);
        this.socket.on("update-banned-list", this.onUpdateBannedList);
        this.socket.on("update-rotation-status", this.onUpdateRotationStatus);
        this.socket.on("update-rotation-list", this.onUpdateRotationList);
        this.socket.on("update-restrict", this.onUpdateRestrict);
        this.socket.on("update-log", this.onUpdateLogs);
        this.socket.on("update-message", this.onUpdateMessage);
        this.socket.on("update-state", this.onUpdateState);

        this.socket && this.socket.emit("request-server-info", this.current.server.host);

        this.toast('Connected to the server');
      } else {
        this.toast('Connection failure');
      }
    },
    // receive server info broadcast
    onUpdateServerInfo: function(res) {
      if(!this.verifyRequest(res)) {
        return;
      }

      if(this.info.current && this.info.current.changeName) {
        for(let item of res.playerList) {
          item.changeName = item.id == this.info.current.id;
        }
      }

      this.info.logs = res.logs;
      this.info.messages = res.messages;
      this.info.playerList = res.playerList || [];
      this.info.bannedList = res.bannedList;
      this.info.state = res.state;
      this.info.mode = res.mode;
      this.info.timeGap = res.now - (new Date()).getTime();

      this.onUpdateState({host: res.host, state: res.state, time: res.time, countdown: res.countdown});

      this.current.connected = true;
      this.current.restrict = res.restrict;
      this.current.autoRotation = res.autoRotation;
      this.current.settings = Object.assign({}, this.current.settings, res.settings);
      this.presets[this.current.name] = this.current;

      if(res.motd) {
        this.current.motd = res.motd;
      }
      
      let list = [];

      for(let key in res.rotationList) {
        let item = res.rotationList[key];

        if(item) {
          list.push(item);
        }
      }

      this.info.rotationList = list;
      this.info.connected = true;
      this.savePresets();
    },
    onUpdateVariable: function(res) {
      if(!this.verifyRequest(res) || res.id == this.id) {
        return;
      }

      this.info.syncVariable = true;
      this.current.settings[res.key] = res.value;
      this.savePresets();
    },
    onUpdatePlayerList: function(res) {
      if(!this.verifyRequest(res)) {
        return;
      }

      if(this.info.current && this.info.current.changeName) {
        for(let item of res.items) {
          item.changeName = item.id == this.info.current.id;
        }
      }

      this.info.playerList = res.items || [];
    },
    onUpdateBannedList: function(res) {
      this.info.bannedList = res.data;
    },
    onUpdateRotationStatus: function(res) {
      if(!this.verifyRequest(res) || res.id == this.id) {
        return;
      }

      this.current.autoRotation = res.value;
    },
    onUpdateRotationList: function(res) {
      if(!this.verifyRequest(res) || res.id == this.id) {
        return;
      }

      let list = [];

      for(let key in res.items) {
        let item = res.items[key];

        if(item) {
          list.push(item);
        }
      }

      this.info.rotationList = list;
    },
    onUpdateRestrict: function(res) {
      if(!this.verifyRequest(res) || res.id == this.i) {
        return;
      }

      this.current.restrict = res.value;
    },
    onUpdateLogs: function(res) {
      if(!this.verifyRequest(res)) {
        return;
      }
      
      this.info.logs = [res.item].concat(this.info.logs);
    },
    onUpdateMessage: function(res) {
      if(!this.verifyRequest(res)) {
        return;
      }

      this.info.messages = [res.item].concat(this.info.messages);
    },
    onUpdateState: function(res) {
      if(!this.verifyRequest(res)) {
        return;
      }

      this.info.state = res.state || 'Unknown';
      this.info.time = '';

      this.stopCountdown();

      let now = new Date().getTime();
      
      if(res.now) {
        this.info.timeGap = now - res.now;
      };

      this.info.countdown = res.countdown + res.time + this.info.timeGap;

      if(!res.countdown || this.info.countdown <= now) {
        this.stopCountdown();
        return;
      }

      let leftTime = Math.floor((this.info.countdown - now) / 1000);

      this.info.time = this.timeFormat(leftTime);

      this.timer.countdown = setInterval(() => {
        leftTime = Math.floor((this.info.countdown - new Date().getTime()) / 1000);

        if(leftTime <= 0) {
          this.stopCountdown();
          return;
        }

        if(this.info.state == 'Countdown' && leftTime > 0 && leftTime <= 10 && !this.info.mute) {
          this.beep();
        }

        this.info.time = this.timeFormat(leftTime);
      }, 1000);
    },
    stopCountdown: function() {
      if(this.timer.countdown) {
        clearInterval(this.timer.countdown);
        this.timer.countdown = null;
        this.info.countdown = 0;
        this.info.time = '';
      }
    },
    verifyRequest: function(res) {
      return res.host == this.current.server.host;
    },
    timeFormat: function(time) {
      let val = '';

      if(time >= 3600) {
        val = this.numFormat(Math.floor(time / 3600)) + ':';
        time = time % 3600;
      }

      if(time >= 60) {
        val += this.numFormat(Math.floor(time / 60)) + ':'
        time = time % 60;
      }

      return time == 0 ? val + '00' : val + this.numFormat(time);
    },
    numFormat: function(num) {
      if(num < 10) {
        return '0' + num;
      }

      return num + '';
    },
    speak: function(word) {
      this.voiceConfig.text = word;
      speechSynthesis.speak(this.voiceConfig);
    },
    beep: function() {
      this.sound.play();
    },
    focus: function(variable) {
      this.info.focus = variable;
    },
    blur: function(variable) {
      this.info.focus = null;
    },
    savePresets() {
      localStorage.setItem("presets_v2", JSON.stringify(this.presets));
    },
    toggle(key, value) {
      this.info[key] = value;
    },
    mute() {
      this.info.mute = true;
      localStorage.setItem("mute", "1");
    },
    unmute() {
      this.info.mute = false;
      localStorage.removeItem("mute");
    },
    createPreset() {
      if(this.info.name.trim() && !this.presets[this.info.name]) {
        var preset = JSON.parse(JSON.stringify(this.default));
        preset.name = this.info.name;

        this.presets[this.info.name] = preset;

        this.savePresets();
        this.switchPreset(this.presets[this.info.name]);
        this.info.name = "";
        this.info.create = false;

        this.toast("New preset created");
        return;
      }

      if(!this.info.name.trim()) {
        this.toast("Please enter preset name");
      } else if(this.presets[this.info.name]) {
        this.toast("Preset name already exists");
      }
    },
    deletePreset() {
      delete this.presets[this.name];

      if(JSON.stringify(this.presets) == "{}") {
        this.presets = {"Default": this.default};
        this.name = this.default.name;
      }
      
      for (const key in this.presets) {
        this.current = this.presets[key];
        this.name = this.current.name;
        break;
      }

      localStorage.setItem("name", this.name);
      this.savePresets();

      this.toast("Preset deleted");
    },
    switchPreset(preset) {
      if(this.name == preset.name) {
        return;
      }
      
      this.disconnect();
      this.current = preset;
      this.name = preset.name;

      if(!this.current.restrict) {
        this.current.restrict = this.default.restrict;
        this.presets[this.name] = this.current;
        localStorage.setItem("presets_v2", JSON.stringify(this.presets));
      }
      
      localStorage.setItem("name", preset.name);
      
      if(!this.current.motd) {
        this.current.motd = "";
      }
      
      if(this.current.connected) {
        this.connect();
      }

      if(this.current.server.host == this.prev) {
        return;
      }
      
      this.prev = this.current.server.host;
    },
    updatePreset() {
      this.presets[this.name] = this.current;
      this.savePresets();
    },
    changeMap(map) {
      this.current.settings.Map = map;
      this.updatePreset();
    },
    saveMOTD() {
      this.info.showMotd = false;

      this.socket.emit('request-update-motd', this.buildRequestParams({motd: this.current.motd}));
    },
    updateRestrictDeck(val) {
      this.current.restrict.deck = val;

      this.updatePreset();

      this.socket.emit('request-update-restrict', this.buildRequestParams(this.current.restrict));
    },
    updateRestrictNation(side, val) {
      this.current.restrict.nation[side].type = val;

      this.updatePreset();

      this.socket.emit('request-update-restrict', this.buildRequestParams(this.current.restrict));
    },
    updateRestrict(key, deck) {
      let str = null;
      
      if(deck == 1) {
        str = this.current.restrict[key];
      } else if(deck == 2) {
        str = this.current.restrict.nation[key].deck;
      }

      if(deck == 1 && str.trim().length > 0) {
        if((new DeckDecoder(str)).nation == 'NONE') {
          this.current.restrict[key] = '';
        }
      } else if(deck == 2 && str.trim().length > 0) {
        if((new DeckDecoder(str)).nation != this.current.restrict.nation[key].type) {
          this.current.restrict.nation[key].deck = '';
        }
      } else {
        if(!this.current.restrict.min) {
          this.current.restrict.min = 0;
        }
        
        if(!this.current.restrict.max) {
          this.current.restrict.max = 0;
        }
      }

      this.updatePreset();

      this.socket.emit('request-update-restrict', this.buildRequestParams(this.current.restrict));
    },
    refresh(e) {
      if(this.timer.refresh) {
        return;
      }

      e.srcElement.setAttribute('class', 'wrd-refresh wrd-refreshing');

      this.socket.emit("request-player-list", this.buildRequestParams());

      let self = this;
      this.timer.refresh = setTimeout(function() {
        e.srcElement.setAttribute('class', 'wrd-refresh');
        self.timer.refresh = null;
      }, 1000);
    },
    updateSetting(variable, value) {
      this.current.settings[variable] = value;

      if(variable != "MaxTeamSize") {
        return;
      }

      this.current.settings.NbMinPlayer = value * 2;
      this.current.settings.NbMaxPlayer = value * 2;
      this.current.settings.DeltaMaxTeamSize = value;
    },
    saveSetting(key) {
      this.presets[this.current.name] = this.current;
      this.savePresets();

      if(!key || !this.info.connected) {
        return;
      }

      if(key == "GameType") {
        let v = this.current.settings[key] * 1;

        this.current.restrict.nation.blue.type = 'BLUFOR';
        this.current.restrict.nation.red.type = 'REDFOR';

        if(v == 1) {
          this.current.restrict.nation.red.type = 'BLUFOR';
        } else if(v == 2) {
          this.current.restrict.nation.blue.type = 'REDFOR';
        }
      }

      if(this.info.syncVariable) {
        this.info.syncVariable = false;
        return;
      }

      this.setServerVariable(key);
    },
    updateNumber(variable, value, min, max) {
      let v = (this.current.settings[variable] * 1) + value;

      if((min && v < min) || (max && v > max) || v <= 0){
        return;
      }

      this.current.settings[variable] = v;
      this.updatePreset();
    },
    addToRotationList() {
      if(this.info.rotationList.indexOf(this.current.settings.Map) == -1) {
        this.current.settings.Map && this.info.rotationList.push(this.current.settings.Map);
      }

      this.changeRotationList();
    },
    removeFromRotationList(map) {
      let idx = this.info.rotationList.indexOf(map);
      if(idx != -1) {
        this.info.rotationList.splice(idx, 1);
      }
      this.changeRotationList();
    },
    changeRotationList: async function() {
      let list = [];

      for(let key in this.info.rotationList) {
        let item = this.info.rotationList[key];

        if(item) {
          list.push(item);
        }
      }
      
      this.socket.emit('request-update-rotation-list', this.buildRequestParams({data: list}))
    },
    connect: async function() {
      this.toast('Connecting to server ...')
      this.socket.once('response-login-' + this.id, this.onLoginResponse);
      this.socket.emit('request-login', this.buildRequestParams());
    },
    disconnect() {
      this.info.playerList = [];
      this.info.bannedList = [];
      this.info.rotationList = [];
      this.info.connected = false;
      this.info.time = '';
      this.info.countdown = 0;
      this.info.showDeckRestrict = false;
      this.info.showLevelRestrict = false;
      this.info.showNationRestrict = false;
      this.info.showRestrict = false;
      this.info.show = 1;
      
      this.stopCountdown();
    },
    push() {
      this.sendVariable('ServerName', this.current.settings);
      this.sendVariable('Password', this.current.settings);
      this.sendVariable('VictoryCond', this.current.settings);
      this.sendVariable('GameType', this.current.settings);
      this.sendVariable('Map', this.current.settings);
      this.sendVariable('Private', this.current.settings);
      this.sendVariable('InitMoney', this.current.settings);
      this.sendVariable('ScoreLimit', this.current.settings);
      this.sendVariable('TimeLimit', this.current.settings);
      this.sendVariable('IncomeRate', this.current.settings);
      this.sendVariable('NbMinPlayer', this.current.settings);
      this.sendVariable('WarmupCountdown', this.current.settings);
      this.sendVariable('DeploiementTimeMax', this.current.settings);
      this.sendVariable('LoadingTimeMax', this.current.settings);
      this.sendVariable('DebriefingTimeMax', this.current.settings);
      this.sendVariable('MaxTeamSize', this.current.settings);
      this.sendVariable('ThematicConstraint', this.current.settings);
      this.sendVariable('NationConstraint', this.current.settings);
      this.sendVariable('DateConstraint', this.current.settings);
      
      this.toast('All variables has been pushed');
    },
    setServerVariable(key) {      
      if(!this.info.connected) {
        return;
      }

      let val = {};

      val[key] = this.current.settings[key];
      
      if(key == 'VictoryCond') {
        val['Map'] = this.current.settings.Map;
      }

      if(key == 'Map') {
        val['VictoryCond'] = this.current.settings.VictoryCond;
      }

      this.sendVariable(key, val);
    },
    sendVariable: async function(key, value) {
      this.socket.emit('request-update-variable', this.buildRequestParams({key: key, value: value}));
    },
    sendCommand: async function(uid, cmd, value, manual) {
      this.socket.emit('request-exec-command', this.buildRequestParams({uid: uid, cmd: cmd, value: value, manual: manual}));
    },
    setAutoRotation: async function() {
      if(this.timer.other) {
        clearTimeout(this.timer.other);
      }

      let self = this;
      this.timer.other = setTimeout(function() {
        self.timer.other = null;
        self.socket.emit('request-update-rotation', self.buildRequestParams({data: self.current.autoRotation}));
  
        self.presets[self.current.name] = self.current;
        self.savePresets();
      }, 300);
    },
    kick: function(item) {
      if(confirm('Are you sure you want to kick ' + item.id + ':' + item.name + '?')) {
        this.sendCommand(item.id, 'kick');

        this.toast('Player ' + item.id + ':' + item.name + ' has been kicked');
      }
    },
    ban: function(item) {
      this.info.current = item;
      this.info.current.reason = '';
      this.info.showBan = true;
    },
    unban: function(item) {
      if(confirm('Are you sure you want to unban ' + item.id + ':' + item.name + '?')) {
        this.sendCommand(item.id, 'unban');
      }
    },
    cancelBan: function() {
      this.info.current = {};
      this.info.showBan = false;
    },
    confirmBan: function() {
      // this.sendCommand(this.info.current.id, 'ban', this.info.banTime);
      this.socket.emit('request-ban-player', this.buildRequestParams({uid: this.info.current.id, time: this.info.banTime, reason: this.info.current.reason}));
      this.info.showBan = false;

      this.toast('Player ' + item.id + ':' + item.name + ' has been banned');
    },
    changeBanTime: function(val) {
      this.info.banTime = val;
    },
    alliance: function(item, alliance) {
      this.sendCommand(item.id, 'alliance', alliance);
    },
    deck: function(item) {
      this.info.current = item;
      this.info.showDeck = true;
    },
    launch: function() {
      this.sendCommand(null, 'launch', null);
    },
    cancelLaunch: function() {
      this.sendCommand(null, 'cancel_launch', null);
    },
    cancel: function() {
      this.info.current = {};
      this.info.showDeck = false;
    },
    confirm: function() {
      if(!(this.info.current.deck && this.info.current.deck.length > 0)) {
        return;
      }
      
      this.sendCommand(this.info.current.id, 'deck', this.info.current.deck);

      this.info.current = {};
      this.info.showDeck = false;
    },
    copy: function() {
      const input = document.createElement('input');
      document.body.appendChild(input);
      //input.setAttribute('value', btoa(encodeURIComponent(JSON.stringify(this.presets))));
      input.setAttribute('value', JSON.stringify(this.presets));
      input.select();

      if (document.execCommand('copy')) {
        document.execCommand('copy');
      }

      document.body.removeChild(input);
      
      this.toast("Preset exported successfully");
    },
    showImportDialog: function() {
      this.info.import = true;
    },
    importPresets: function() {
      if(!(this.info.presets && this.info.presets.length > 0)) {
        return;
      }

      var presets = null;
      try {
        presets = JSON.parse(decodeURIComponent(atob(this.info.presets)));
      } catch (error) {
        try{
          presets = JSON.parse(this.info.presets);
        } catch(error) {
          return;
        }
      }
      
      if((typeof presets) != "object") {
        return;
      }
      
      var current = null;
      var name = null;
      
      for (const key in presets) {
        presets[key] = Object.assign({}, this.default, presets[key]);

        if(!current) {
          name = key;
          current = presets[key];
        }
      }
      
      if(current == null) {
        return;
      }

      this.info.import = false;
      this.info.presets = '';

      this.presets = presets;
      this.current = current;

      this.savePresets();

      localStorage.setItem("name", name);
      
      this.toast("Preset imported successfully");
    },
    cancelImport: function() {
      this.info.import = false;
    },
    check: function(presets) {
      let config = {};
      let count = 0;

      for (const key in presets) {
        let item = presets[key];
 
        if(item.version && item.version == 2) {
          config[key] = item;
          count++;
        }
      }

      if(!count) {
        config[this.default.name] = this.default;
      }

      return presets;
    },
    fetchTooltip: function(player) {
      let country = COUNTRIES[player.country] ? `[${player.country}] ${COUNTRIES[player.country]}` : player.country;

      let tooltip = `${country}`;

      if(player.city) {
        tooltip = `${tooltip}, ${player.city}`;
      }

      return tooltip;
    },
    fetchBanReason: function(player) {
      return player.reason || 'no reason';
    },
    sendManualCommand: function() {
      if(!this.info.manualCommand || this.info.manualCommand.trim().length == 0) {
        return;
      }

      this.sendCommand(null, this.info.manualCommand, null, true);
      this.info.manualCommand = null;
    },
    currentMapPreview: function() {
      if(this.current.settings.VictoryCond == 4) {
        return '/assets/maps/4/' + this.current.settings.Map + '.jpg';
      }

      return '/assets/maps/1/' + this.current.settings.Map + '.jpg';
    },
    changeName: function(item) {
      item.changeName = true;
      this.info.current = item;
      this.info.current.oldName = item.name;
      this.$forceUpdate();

      this.$nextTick(() => {
        let e = this.$refs[`name_${item.id}`];
        !e || e[0].focus();
      });
    },
    confirmChangeName: function(item) {
      delete item.changeName;
      this.$forceUpdate();

      this.socket.emit('request-change-player-name', this.buildRequestParams({uid: this.info.current.id, name: item.name}));

      this.info.current = null;
    }
  }
});