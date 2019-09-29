var HighLow = artifacts.require("./HighLow.sol");

// Bidding time for each round
var biddingTime = 30;
var revealTime = 10;
var val = web3.utils.toWei("100", "ether");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(HighLow, accounts[9], { from: accounts[9], value: val });
  //   var highLowInstance = await HighLow.deployed();
  //   var delay = (biddingTime + revealTime) * 1000;
  //   while (true) {
  //     await sleep(delay);
  //     await highLowInstance.roundEnd();
  //   }
};
