const HighLow = artifacts.require('HighLow')

contract('HighLow', (accounts) => {
    before(async () => {
        this.highLow = await HighLow.deployed()
    })

    it('deployed successfully, address not null', async() => {
        const address = await this.highLow.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })
})
