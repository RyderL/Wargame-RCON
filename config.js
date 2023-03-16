let hosts = {
  // "ip:port": "wargame server working directory"
  // Example
  "1.2.3.4:5678": "/data/wargame/1"
}

// To enable joint ban, set globalBan to true (WIP)
// Please do not enable globalBan on the main server, the globalBanToken of other servers need to be consistent with the main server
// With globalBan enabled, the server will sync the bannedList from the main server every 5 minutes
// Currently does not support https protocol
let globalBan = false;
let globalBanUrl = "http://wrd.endless.ws";
let globalBanToken = "50c33524-e450-4352-97b7-3259c45e4fd0";

// Used to get user steam profile
// read more https://steamcommunity.com/dev
let steamApiKey = "YOUR_STEAM_WEB_API_KEY";

module.exports = { hosts, globalBan, globalBanToken, globalBanUrl, steamApiKey };