# High Low

Implementation of a House vs Players High Low game. Very similar to [this implementation](https://www.mathsisfun.com/games/higher-or-lower.html)

## Getting started

```
((git clone))
npm install
truffle compile
truffle migrate --reset
truffle test
```
Note that all the commands assume here you have ganache running.

### If you wish to use truffle console
```
truffle console
> var hl = await contractname.deployed()
((( do whatever )))
```

## Tests to be written

- Multiple rounds single person
- Multiple people in a single round
- Multiple people and multiple rounds
- Bet from one address and reveal from another address
- Bet with 0 amount
- After bet is made, time starts
- After all reveals, time resets
