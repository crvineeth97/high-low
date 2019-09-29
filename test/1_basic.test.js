var HighLow = artifacts.require("./HighLow.sol");

contract("HighLow", function (accounts)
{
    var highLowInstance;
    before(async () =>
    {
        highLowInstance = await HighLow.deployed()
    })

    it('Deployed successfully, Address not null', async () =>
    {
        const address = await highLowInstance.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    });
});