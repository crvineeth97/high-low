var HighLow = artifacts.require("./HighLow.sol");
var accounts;

web3.eth.getAccounts().then((acc) =>
{
    accounts = acc;
});


contract("HighLow", (accounts) =>
{
    before(async () =>
    {
        this.highLow = await HighLow.deployed();
    })


    it("Maximum number of Cards is correct", async () =>
    {
        const maxCards = await this.highLow.maxNoOfCards();
        assert.equal(maxCards, 52);
    })

    it("Initialisation of Cards is correct", async () =>
    {
        const maxCards = await this.highLow.maxNoOfCards();

        for (var i = 0; i < maxCards; i++)
        {
            let deck = await this.highLow.deck(i);
            assert.equal(deck.number, ((i % 13) + 1));
            assert.equal(deck.colour, (Math.floor(i / 26) != 0));
            // assert.equal(deck[i].cardType, ((Math.floor(i / 13)%2)!=0));
        }
    })

    it("Beneficiary address is the same as contract creator", async () =>
    {
        const addr = accounts[9];
        const addrcon = await this.highLow.beneficiary();
        assert.equal(addr, addrcon);
    })

    it("Start-of-round time is not 0", async () =>
    {
        const time = await this.highLow.creationTime();
        assert.notEqual(time, 0);
    })

    // it("Current time is greater than Start-of-round time", async () =>
    // {
    //     const time = await this.highLow.creationTime();
    //     let ctime = Math.round(Date.now() / 1000);
    //     assert.isTrue(ctime > time);
    // })

    it("Check that placedCard exists", async () =>
    {
        const placedCard = await this.highLow.placedCard();
        assert.notEqual(placedCard, 0x0)
        assert.notEqual(placedCard, '')
        assert.notEqual(placedCard, null)
        assert.notEqual(placedCard, undefined)
    })
}); 