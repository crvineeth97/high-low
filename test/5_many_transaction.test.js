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

    it("Three users bid and then reveal their bids after betting time", async function ()
    {
        var rnd1 = getRandomHex();
        var prediction1 = true;
        var blindedPrediction1 = getKeccak(prediction1, rnd1);
        var account1 = accounts[5];
        
        var rnd2 = getRandomHex();
        var prediction2 = true;
        var blindedPrediction2 = getKeccak(prediction2, rnd2);
        var account2 = accounts[4];
        
        var rnd3 = getRandomHex();
        var prediction3 = true;
        var blindedPrediction3 = getKeccak(prediction3, rnd3);
        var account3 = accounts[3];
        
        var oldbalance1 = await web3.eth.getBalance(account1);
        var oldbalance2 = await web3.eth.getBalance(account2);
        var oldbalance3 = await web3.eth.getBalance(account3);
        

        var val = web3.utils.toWei("1", "ether");
        var placedCard = await highLowInstance.placedCard();
        
        

        await highLowInstance.bet(blindedPrediction1, { from: account1, value: val });
        await highLowInstance.bet(blindedPrediction2, { from: account2, value: val });
        await highLowInstance.bet(blindedPrediction3, { from: account3, value: val });
        

        var newbalance1 = await web3.eth.getBalance(account1);
        var newbalance2 = await web3.eth.getBalance(account2);
        var newbalance3 = await web3.eth.getBalance(account3);


        assert.isTrue(newbalance1 <= oldbalance1 - web3.utils.toBN(val), "#1 Amount not deducted");
        assert.isTrue(newbalance2 <= oldbalance2 - web3.utils.toBN(val), "#2 Amount not deducted");
        assert.isTrue(newbalance3 <= oldbalance3 - web3.utils.toBN(val), "#3 Amount not deducted");        

        await sleep(20000);
        
        await highLowInstance.reveal(prediction1, rnd1, { from: account1});
        await highLowInstance.reveal(prediction2, rnd2, { from: account2});
        await highLowInstance.reveal(prediction3, rnd3, { from: account3});

        
        var newPlacedCard = await highLowInstance.placedCard();


        newbalance1 = await web3.eth.getBalance(account1);
        newbalance2 = await web3.eth.getBalance(account2);
        newbalance3 = await web3.eth.getBalance(account3);

        // console.log(newPlacedCard.number, placedCard.number);
        // console.log(newbalance1, oldbalance1);
        // console.log(newbalance2, oldbalance2);
        // console.log(newbalance3, oldbalance3);

        if ((newPlacedCard.number - placedCard.number) > 0 )
        {
            assert.isTrue((newbalance1 - oldbalance1) > 0, "#1 Error did not receive money");
            assert.isTrue((newbalance1 - oldbalance1) <= web3.utils.toBN(val), "#1 Error did not receive exact money");

            assert.isTrue((newbalance2 - oldbalance2) > 0, "#2 Error did not receive money");
            assert.isTrue((newbalance2 - oldbalance2) <= web3.utils.toBN(val), "#2 Error did not receive exact money");

            assert.isTrue((newbalance3 - oldbalance3) > 0, "#3 Error did not receive money");
            assert.isTrue((newbalance3 - oldbalance3) <= web3.utils.toBN(val), "#3 Error did not receive exact money");
        }
        else// if (placedCard.number > newPlacedCard.number)
        {   
            assert.isTrue((oldbalance1 - newbalance1) >= 0, "#1 Error did not lose money");
            assert.isTrue((oldbalance1 - newbalance1) >= web3.utils.toBN(val) , "#1 Error did not lose exact money");
        
            assert.isTrue((oldbalance2 - newbalance2) >= 0, "#2 Error did not lose money");
            assert.isTrue((oldbalance2 - newbalance2) >= web3.utils.toBN(val) , "#2 Error did not lose exact money");
        
            assert.isTrue((oldbalance3 - newbalance3) >= 0, "#3 Error did not lose money");
            assert.isTrue((oldbalance3 - newbalance3) >= web3.utils.toBN(val) , "#3 Error did not lose exact money");        
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

contract("HighLow", (accounts) => {
    let highLowInstance;
    before(async () => {
        highLowInstance = await HighLow.deployed();
        highLowInstance.initializeRound();
    })

    after(async () => {
        highLowInstance.endGame();
    })

    it("Three users bid and then reveal their bids after betting time in multiple rounds", async () => {
        let val;
        let placedCard;
        let newPlacedCard;
            
        let oldbalance1, oldbalance2, oldbalance3;
        let newbalance1, newbalance2, newbalance3; 
        let prediction1, prediction2, prediction3;
        let account1, account2, account3;
        let rnd1, rnd2, rnd3;

        for (let i = 0; i < 5; i++) 
        {

            rnd1 = getRandomHex();
            prediction1 = true;
            blindedPrediction1 = getKeccak(prediction1, rnd1);
            account1 = accounts[5];
            
            rnd2 = getRandomHex();
            prediction2 = true;
            blindedPrediction2 = getKeccak(prediction2, rnd2);
            account2 = accounts[4];
            
            rnd3 = getRandomHex();
            prediction3 = true;
            blindedPrediction3 = getKeccak(prediction3, rnd3);
            account3 = accounts[3];
            
            oldbalance1 = await web3.eth.getBalance(account1);
            oldbalance2 = await web3.eth.getBalance(account2);
            oldbalance3 = await web3.eth.getBalance(account3);

            val = web3.utils.toWei("1", "ether");
            placedCard = await highLowInstance.placedCard();
            

            await highLowInstance.bet(blindedPrediction1, { from: account1, value: val });
            await highLowInstance.bet(blindedPrediction2, { from: account2, value: val });
            await highLowInstance.bet(blindedPrediction3, { from: account3, value: val });
            

            newbalance1 = await web3.eth.getBalance(account1);
            newbalance3 = await web3.eth.getBalance(account3);
            newbalance2 = await web3.eth.getBalance(account2);


            assert.isTrue(newbalance1 <= oldbalance1 - web3.utils.toBN(val), "#1 Amount not deducted");
            assert.isTrue(newbalance2 <= oldbalance2 - web3.utils.toBN(val), "#2 Amount not deducted");
            assert.isTrue(newbalance3 <= oldbalance3 - web3.utils.toBN(val), "#3 Amount not deducted");        

            await sleep(20000);
            
            await highLowInstance.reveal(prediction1, rnd1, { from: account1});
            await highLowInstance.reveal(prediction2, rnd2, { from: account2});
            await highLowInstance.reveal(prediction3, rnd3, { from: account3});

            
            newPlacedCard = await highLowInstance.placedCard();


            newbalance1 = await web3.eth.getBalance(account1);
            newbalance2 = await web3.eth.getBalance(account2);
            newbalance3 = await web3.eth.getBalance(account3);

            if ((newPlacedCard.number - placedCard.number) > 0 )
            {
                assert.isTrue((newbalance1 - oldbalance1) > 0, "#1 Error did not receive money");
                assert.isTrue((newbalance1 - oldbalance1) <= web3.utils.toBN(val), "#1 Error did not receive exact money");

                assert.isTrue((newbalance2 - oldbalance2) > 0, "#2 Error did not receive money");
                assert.isTrue((newbalance2 - oldbalance2) <= web3.utils.toBN(val), "#2 Error did not receive exact money");

                assert.isTrue((newbalance3 - oldbalance3) > 0, "#3 Error did not receive money");
                assert.isTrue((newbalance3 - oldbalance3) <= web3.utils.toBN(val), "#3 Error did not receive exact money");
            }
            else// if (placedCard.number > newPlacedCard.number)
            {   
                assert.isTrue((oldbalance1 - newbalance1) >= 0, "#1 Error did not lose money");
                assert.isTrue((oldbalance1 - newbalance1) >= web3.utils.toBN(val) , "#1 Error did not lose exact money");
            
                assert.isTrue((oldbalance2 - newbalance2) >= 0, "#2 Error did not lose money");
                assert.isTrue((oldbalance2 - newbalance2) >= web3.utils.toBN(val) , "#2 Error did not lose exact money");
            
                assert.isTrue((oldbalance3 - newbalance3) >= 0, "#3 Error did not lose money");
                assert.isTrue((oldbalance3 - newbalance3) >= web3.utils.toBN(val) , "#3 Error did not lose exact money");        
            }
        }
        // stage = highLowInstance.stage();
        // assert.isTrue(highLowInstance.atS(0), "Did not switch to betStage on time");        

        // await highLowInstance.bet(blindedPrediction, {from: account, value: val});
        // await sleep(17000);
        
        // await highLowInstance.reveal
        await highLowInstance.endGame();        

    })
})