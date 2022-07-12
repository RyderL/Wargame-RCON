function DeckDecoder(val) {
  this.side = "NONE";
  this.nation = "NONE";
  this.spec = "GEN";
  this.era = "A";

  this.decode(val);
}

DeckDecoder.prototype.decode = function(deck) {
  if (deck.length < 4 ) { return; }
  
  let binaryData = null;
  let binary = "";
  
  try {
    binaryData = Buffer.from(data, 'base64').toString('binary');
  } catch {
    binaryData = atob(deck.substr(1));
  }

  for(let i=0; i<binaryData.length; i++) {
    let bin = binaryData.charCodeAt(i).toString(2);
    binary += Array(8-bin.length+1).join("0") + bin;
  }

  this.code = binary.substr(0, 12);
  this.side = binary.charAt(1) * 1;
  this.nation = NATION_MAPPING[this.code];
  this.spec = parseInt(binary.substr(12, 3), 2);
  this.era = parseInt(binary.substr(15, 2), 2);

  if(!this.nation) {
    console.log('unable to parse deck, code: ' + this.code);
  }
}

let NATION_MAPPING = {
  '000000001001': 'NATO',
  '000111100000': 'NATO',
  '000111100010': 'NATO',
  '000111101001': 'NATO',
  '000111101000': 'NATO',
  '001000001100': 'NATO',
  '000000001100': 'US',
  '000010001100': 'CAN',
  '001000001000': 'NORAD',
  '000000101100': 'UK',
  '000001001100': 'FRA',
  '000001101010': 'RFA',
  '000001101100': 'RFA',
  '000010101100': 'DAN',
  '000011001100': 'SWE',
  '000100001100': 'ANZ',
  '001000000010': 'CMW',
  '000100101100': 'JAP',
  '000101001100': 'ROK',
  '000101101100': 'HOL',
  '000110001100': 'ISR',
  '000110001010': 'ISR',
  '000111101100': 'SA',
  '001000000000': 'EURO',
  '001000000001': 'SCAND',
  '000111100001': 'SCAND',
  '001000000110': 'LAND',
  '000011101100': 'NOR',
  '001000000011': 'BLUEDRAGONS',
  '001000001001': 'NLGR',
  '010000001100': 'RDA',
  '010000101100': 'USSR',
  '010000101010': 'USSR',
  '010000101001': 'USSR',
  '010010001100': 'CHI',
  '010010101100': 'NK',
  '010100100100': 'REDDRAGONS',
  '010100100101': 'NSWP',
  '010011001100': 'FIN',
  '010100101010': 'FINPOL',
  '010001001100': 'POL',
  '010011101100': 'YUG',
  '010001101100': 'CZ',
  '010100101011': 'YUGVAK',
  '010100101100': 'REDFOR'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeckDecoder;
}