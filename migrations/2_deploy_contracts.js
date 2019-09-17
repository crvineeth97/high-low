var HighLow = artifacts.require("./HighLow.sol");

// Bidding time for each round
var biddingTime = 30

// Reveal time for each round
var revealTime = 10

// Last account in our local Ganache
var houseAddress = "0x5b327Fd9d785a7fF939f35430Db0fcEDd1a350b6"

module.exports = function(deployer, network, address) {
  deployer.deploy(HighLow, biddingTime, revealTime, address[0]);
};
