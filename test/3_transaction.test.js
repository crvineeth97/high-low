var HighLow = artifacts.require("./HighLow.sol");
var accounts;

web3.eth.getAccounts().then((acc) => {
    accounts = acc;
});

function getRandomHex()
{
    return web3.utils.randomHex(32)
}

function getKeccak(prediction, rnd)
{
    // var rnd = getRandomHex();
    var hx = web3.utils.keccak256(web3.utils.toHex(prediction) + rnd, { encoding: "hex" });
    return web3.utils.hexToBytes(hx);
}

const sleep = (milliseconds) =>
{
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getBalance(acc)
{
    let balance = 0;
    web3.eth.getBalance(acc).then(function (bal)
    {
        balance = web3.utils.fromWei(bal);                
    });
    return balance;
}

contract("HighLow", (accounts) => {
    before(async () => {
        this.highLow = await HighLow.deployed();
        await this.highLow.initializeRound();
    })

    // it("Test", async() => {
    //     assert.equal(1, 1);
    // })

    it("User can bet successfully", async() => {
        let rnd = getRandomHex();
        let prediction = false;
        let byt = getKeccak(prediction, rnd);
        let account = accounts[1];
        let val = 1;
        let balance = getBalance(account);
        
        this.highLow.bet(byt, {from: account, value: val}).then(() => {
            let balance2 = getBalance(account);
            assert.equal(balance2, balance-val, "The amount bet has been taken from wallet.");
            assert.equal(1, 0);
        });
    })
})

    
// }
    // it("A user bets and then reveals his bet after betting time", function ()
    // {
    //     return HighLow.deployed().then(function (instance)
    //     {
    //         highLowInstance = instance;
    //         return highLowInstance;
    //     }).then(function (highLowInstance)
    //     {
    //         var rnd = getRandomHex();
    //         var prediction = false;
    //         var byt = getKeccak(prediction, rnd);
    //         var account = accounts[5];
    //         var val = 5;
    //         var balance;
    //         web3.eth.getBalance(account).then(function (bal)
    //         {
    //             balance = web3.utils.fromWei(bal);                
    //         });
    //         highLowInstance.bet(byt, { from: account, value: val }).then(function ()
    //         {
    //             // Call function to get new balance and check if balance - val = new balance
    //             assert(balance)
    //             sleep(3000);
    //         }).then(function ()
    //         {
    //             highLowInstance.reveal(prediction, rnd).then(function ()
    //             {
    //                 // Test for balance here again?
    //             })
    //         });
    //     }).then(function (candidate)
    //     {
    //         assert.equal(candidate[0], 2, "contains the correct id");
    //         assert.equal(candidate[1], "Candidate 2", "contains the correct name");
    //         assert.equal(candidate[2], 0, "contains the correct votes count");
    //     });
    // });