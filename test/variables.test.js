var HighLow = artifacts.require("./HighLow.sol");
var accounts;

web3.eth.getAccounts().then((acc) => {
    accounts = acc;
});


contract("HighLow", (accounts) =>
{
    before(async () => {
        this.highLow = await HighLow.deployed()
    })

    // it("")

    it("Maximum number of Cards is correct", async() => {
        const maxCards = await this.highLow.maxNoOfCards();
        assert.equal(maxCards, 52);
    })

    it("Initialisation of Cards is correct", async() => {
        const maxCards = await this.highLow.maxNoOfCards();

        for (var i = 0; i < maxCards; i++) {
            let deck = await this.highLow.deck(i);
            assert.equal(deck.number, ((i%13)+1));
            assert.equal(deck.colour, Math.floor(i/26));
            assert.equal(deck[i].cardType, Math.floor(i / 13));
        }
    })

    it("Beneficiary address is the same as contract creator", async() => {
        const addr = accounts[0];
        const addrcon = await this.highLow.beneficiary();
        assert.equal(addr, addrcon);
    })

    it("Bidding time is correct", async() => {
        const bidTime = await this.highLow.biddingTime();
        assert.equal(bidTime, 30);
    })

    it("Reveal time is set correctly", async() => {
        const revealTime = await this.highLow.revealTime();
        assert.equal(revealTime, 10);
    })

    it("Check that placedCard exists", async() => {
        const placedCard = await this.highLow.placedCard();
        assert.notEqual(placedCard, 0x0)
        assert.notEqual(placedCard, '')
        assert.notEqual(placedCard, null)
        assert.notEqual(placedCard, undefined)
    })

//     it("A user bets and then reveals his bet after betting time", function ()
//     {
//         return HighLow.deployed().then(function (instance)
//         {
//             highLowInstance = instance;
//             return highLowInstance;
//         }).then(function (highLowInstance)
//         {
//             var rnd = getRandomHex();
//             var prediction = false;
//             var byt = getKeccak(prediction, rnd);
//             var account = accounts[5];
//             var val = 5;
//             var balance;
//             web3.eth.getBalance(account).then(function (bal)
//             {
//                 balance = web3.utils.fromWei(bal);                
//             });
//             highLowInstance.bet(byt, { from: account, value: val }).then(function ()
//             {
//                 // Call function to get new balance and check if balance - val = new balance
//                 assert(balance)
//                 sleep(3000);
//             }).then(function ()
//             {
//                 highLowInstance.reveal(prediction, rnd).then(function ()
//                 {
//                     // Test for balance here again?
//                 })
//             });
//         }).then(function (candidate)
//         {
//             assert.equal(candidate[0], 2, "contains the correct id");
//             assert.equal(candidate[1], "Candidate 2", "contains the correct name");
//             assert.equal(candidate[2], 0, "contains the correct votes count");
//         });
//     });
}); 