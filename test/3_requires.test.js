// require('chai')
//     .use(require('chai-as-promised'))
//     .should()
// var HighLow = artifacts.require("./HighLow.sol");
// var accounts;

// web3.eth.getAccounts().then((acc) =>
// {
//     accounts = acc;
// });

// function getRandomHex()
// {
//     return web3.utils.randomHex(32)
// }

// function getKeccak(prediction, rnd)
// {
//     // var rnd = getRandomHex();
//     var hx = web3.utils.soliditySha3(prediction, rnd);
//     return web3.utils.hexToBytes(hx);
// }

// const sleep = (milliseconds) =>
// {
//     return new Promise(resolve => setTimeout(resolve, milliseconds))
// }


// contract("HighLow", (accounts) =>
// {
//     var highLowInstance;
//     before(async () =>
//     {
//         highLowInstance = await HighLow.deployed();
//         highLowInstance.initializeRound();
//     })

//     after(async () =>
//     {
//         highLowInstance.endGame();
//     })

//     it("User bet with an amount of 0 is rejected", async function ()
//     {
//         var rnd = getRandomHex();
//         var prediction = false;
//         var blindedPrediction = getKeccak(prediction, rnd);
//         var account = accounts[3];
//         var val = web3.utils.toWei("0", "ether");
//         await highLowInstance.bet(blindedPrediction, { from: account, value: val }).should.be.rejected;
//     });
// })

// contract("HighLow", (accounts) =>
// {
//     var highLowInstance;
//     before(async () =>
//     {
//         highLowInstance = await HighLow.deployed();
//         highLowInstance.initializeRound();
//     })

//     after(async () =>
//     {
//         highLowInstance.endGame();
//     })

//     it("Betting time starts only after the first bid to avoid empty rounds and time resets after all reveals", async function ()
//     {
//         // For logic reasons, the creationTime in the contract is set to
//         // 2*now when the first bet has not been placed.
//         var rnd = getRandomHex();
//         var prediction = true;
//         var blindedPrediction = getKeccak(prediction, rnd);
//         var account = accounts[5];
//         var val = web3.utils.toWei("2", "ether");
        
//         var initCreationTime = await highLowInstance.creationTime();
        
//         await highLowInstance.bet(blindedPrediction, { from: account, value: val });
        
//         var newCreationTime = await highLowInstance.creationTime();
        
//         assert.isTrue(newCreationTime < initCreationTime, "Round initial creation time is not greater than creation time after betting");
//         await sleep(6000);
//         await highLowInstance.reveal(prediction, rnd, { from: account});
        
//         initCreationTime = await highLowInstance.creationTime();
//         assert.isTrue(newCreationTime < initCreationTime, "New round initial creation time is not greater than time after betting");
//     });
// })

// contract("HighLow", (accounts) =>
// {
//     var highLowInstance;
//     before(async () =>
//     {
//         highLowInstance = await HighLow.deployed();
//         highLowInstance.initializeRound();
//     })

//     after(async () =>
//     {
//         highLowInstance.endGame();
//     })

//     it("User betting from one address and trying to reveal using a different address gets rejected", async function ()
//     {
//         var rnd = getRandomHex();
//         var prediction = false;
//         var blindedPrediction = getKeccak(prediction, rnd);
//         var account = accounts[3];
//         var val = web3.utils.toWei("1", "ether");
        
//         await highLowInstance.bet(blindedPrediction, { from: account, value: val });
//         await sleep(6000);
        
//         await highLowInstance.reveal(prediction, rnd, { from: accounts[4] }).should.be.rejected;
//     });
// })

// contract("HighLow", (accounts) =>
// {
//     var highLowInstance;
//     before(async () =>
//     {
//         highLowInstance = await HighLow.deployed();
//         highLowInstance.initializeRound();
//     })

//     after(async () =>
//     {
//         highLowInstance.endGame();
//     })

//     it("User bets and uses a different random number for reveal phase gets rejected", async function ()
//     {
//         var rnd1 = getRandomHex();
//         var rnd2 = getRandomHex();
//         var prediction = false;
//         var blindedPrediction = getKeccak(prediction, rnd1);
//         var account = accounts[3];
//         var val = web3.utils.toWei("1", "ether");
//         await highLowInstance.bet(blindedPrediction, { from: account, value: val });
//         await sleep(6000);
//         await highLowInstance.reveal(prediction, rnd2, { from: account }).should.be.rejected;
//     });
// })