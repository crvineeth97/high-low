var accounts;
web3.eth.getAccounts().then(function (acc) { accounts = acc; });
function getRandomHex() { return web3.utils.randomHex(32); }
function getKeccak(prediction, rnd) { var hx = web3.utils.keccak256(web3.utils.toHex(prediction) + rnd, { encoding: "hex" }); return web3.utils.hexToBytes(hx); }
var rnd = getRandomHex();
var prediction = false;
var blindedPrediction = getKeccak(prediction, rnd);
var account = accounts[5];
var val = 5;
var oldBalance = await web3.eth.getBalance(account)
oldBalance = web3.utils.fromWei(oldBalance)
var highLowInstance = await HighLow.deployed()
var biddingEnd = await highLowInstance.biddingEnd()
biddingEnd = web3.utils.hexToNumber(biddingEnd)
await highLowInstance.bet(blindedPrediction, { from: account, value: val })
var rnd = getRandomHex();
var prediction = true;
var blindedPrediction = getKeccak(prediction, rnd);
var account = accounts[2];
var val = 5;