const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');

const rcon = require('./rcon')

var win = null;

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  win.webContents.openDevTools();
};

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('login', function (event, data) {
  var id = data.id;

  if (!global.index) {
      global.index = 1;
  } else {
      destoryConnection();
      global.index = global.index + 1;
  }

  global[global.index] = {
      auth: false,
      connect: false,
      rcon: null
  };

  global[global.index].rcon = new rcon(data.ip, data.port, data.password, {
      id: id
  });
  global[global.index].rcon.on('response', ResponseHandler);
  global[global.index].rcon.connect();
});

ipcMain.on('command', function (event, data) {
  var id = data.id,
      cmd = data.cmd;

  if (isLogged(id)) {
      global[global.index].rcon.send(cmd);
  } else {
    win.webContents.send('logged-' + id, false);
  }
});

ipcMain.on('disconnect', () => {
    destoryConnection();
});

var isLogged = function(id) {
  return global[global.index] && global[global.index].rcon && global[global.index].auth;
}

var destoryConnection = function() {
  if(global[global.index] && global[global.index].rcon) {
    global[global.index].rcon.disconnect();
    delete global[global.index];
  }
}

var ResponseHandler = function(res) {
  var clientId = res.id;
  var data = res.data;
  
  // 登录数据包, 只有成功登录后才会有数据返回, 否则只有异常
  if(global[global.index] && !global[global.index].auth) {
    global[global.index].auth = true;
    win.webContents.send('logged-' + clientId, true);
  } else if(data.indexOf('Client List :') > -1) {
    var list = data.replace('\0','').replace('Client List :\n','').split('\n');
    var result = [];
    
    if(!(list.length == 1 && list[0] == "Server is empty !")) {
      for (const key in list) {
        var str = list[key].trim();
  
        if(str && str != '') {
          var idx = str.indexOf(' ');
          var id = str.substr(0, idx);
          var name = str.substr(idx + 1);
          
          if(name.length > 19) {
            name = name.substring(0, 19) + '...';
          }

          result.push({id, name});
        }
      }
    }
    
    win.webContents.send('show-player-list-' + clientId, result);
  } else {
  }
}