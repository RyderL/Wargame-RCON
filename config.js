let hosts = {
  // "ip:port": "wargame server working directory"
  // Example
  "1.2.3.4:5678": "/data/wargame/1"
}

// To enable joint ban, set globalBanDatabase to true and need to set correct globalBanToken (WIP)
let globalBanDatabase = false;
let globalBanToken = "50c33524-e450-4352-97b7-3259c45e4fd0";
let globalBanDatabaseUrl = "https://wrd.endless.ws";

// Used to get user steam profile
// read more https://steamcommunity.com/dev
let steamApiKey = "YOUR_STEAM_WEB_API_KEY";

module.exports = { hosts, globalBanDatabase, globalBanToken, globalBanDatabaseUrl, steamApiKey };