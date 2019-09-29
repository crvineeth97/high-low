var HighLow = artifacts.require("./HighLow.sol");
var accounts;

web3.eth.getAccounts().then((acc) =>
{
    accounts = acc;
});

function getRandomHex()
{
    return web3.utils.randomHex(32)
}

function getKeccak(prediction, rnd)
{
    // var rnd = getRandomHex();
    var hx = web3.utils.soliditySha3(prediction, rnd);
    return web3.utils.hexToBytes(hx);
}

const sleep = (milliseconds) =>
{
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

contract("HighLow", (accounts) =>
{
    var highLowInstance;
    before(async () =>
    {
        highLowInstance = await HighLow.deployed();
        highLowInstance.initializeRound();
    })

    after(async () =>
    {
        highLowInstance.endGame();
    })

    it("A user bids and then reveals his bid after betting time", async function ()
    {
        var rnd = getRandomHex();
        var prediction = true;
        var blindedPrediction = getKeccak(prediction, rnd);
        var account = accounts[5];
        
        var val = web3.utils.toWei("2", "ether");
        var oldbalance = await web3.eth.getBalance(account);
        var placedCard = await highLowInstance.placedCard();
        
        await highLowInstance.bet(blindedPrediction, { from: account, value: val });
        
        var newbalance = await web3.eth.getBalance(account);
        assert.isTrue(newbalance <= oldbalance - web3.utils.toBN(val), "Amount not deducted");
        await sleep(12000);
        
        await highLowInstance.reveal(prediction, rnd, { from: account});
        var newPlacedCard = await highLowInstance.placedCard();
        newbalance = await web3.eth.getBalance(account);
        console.log(placedCard.number, newPlacedCard.number);
        console.log(oldbalance, newbalance);
        if ((newPlacedCard.number - placedCard.number) > 0 )
        {
            assert.isTrue((newbalance - oldbalance) > 0, "Error did not receive money");
            assert.isTrue((newbalance-oldbalance) <= web3.utils.toBN(val), "Error did not receive exact money");
        }
        else// if (placedCard.number > newPlacedCard.number)
        {   
            assert.isTrue((oldbalance - newbalance) >= 0, "Error did not lose money");
            assert.isTrue((oldbalance - newbalance) >= web3.utils.toBN(val) , "Error did not lose exact money");
        }
        // else 
        // {
        //     newbalance = await web3.eth.getBalance(account);
        //     // assert.isTrue(newbalance < oldbalance, "Error did not lose money");
        //     assert.isTrue(newbalance <= oldbalance - web3.utils.toBN(val) , "Error did not lose money");
        // }
        await highLowInstance.endGame();
    });
})

// contract("HighLow", (accounts) => {
//     let highLowInstance;
//     before(async () => {
//         highLowInstance = await HighLow.deployed();
//         highLowInstance.initializeRound();
//     })

//     after(async () => {
//         highLowInstance.endGame();
//     })

//     it("A user bids in multiple rounds", async () => {
//         let account = accounts[6];
//         let val = web3.utils.toWei("1", "ether");
            
//         let oldbalance, newbalance, placedCard, newPlacedCard;

//         for (let i = 0; i < 5; i++) 
//         {
//             let rnd = getRandomHex();
//             let prediction = true;
//             let blindedPrediction = getKeccak(prediction, rnd);    

//             oldbalance = await web3.eth.getBalance(account);
//             placedCard = await highLowInstance.placedCard();
            
//             await highLowInstance.bet(blindedPrediction, {from: account, value: val});
//             newbalance = await web3.eth.getBalance(account);
//             assert.isTrue(newbalance <= oldbalance - web3.utils.toBN(val), "Amount not deducted");

//             await sleep(12000);
//             await highLowInstance.reveal(prediction, rnd, {from: account});

//             newbalance = await web3.eth.getBalance(account);
//             newPlacedCard = await highLowInstance.placedCard();

//             console.log(placedCard.number, newPlacedCard.number);
//             if (placedCard.number < newPlacedCard.number)
//             {
//                 assert.isTrue(newbalance > oldbalance, "Error did not receive money");
//                 assert.isTrue((newbalance-oldbalance) <= web3.utils.toBN(val), "Error did not receive exact money");
//             }
//             else// if (placedCard.number > newPlacedCard.number)
//             {   
//                 assert.isTrue(newbalance <= oldbalance, "Error did not lose money");
//                 assert.isTrue((oldbalance - newbalance) >= web3.utils.toBN(val) , "Error did not lose exact money");
//             }
//         }
//         // stage = highLowInstance.stage();
//         // assert.isTrue(highLowInstance.atS(0), "Did not switch to betStage on time");        

//         // await highLowInstance.bet(blindedPrediction, {from: account, value: val});
//         // await sleep(12000);
        
//         // await highLowInstance.reveal
//         await highLowInstance.endGame();        

//     })
// })