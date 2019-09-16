pragma solidity ^0.5.0;

contract HighLow
{

    // Represent each card as a struct
    struct Card
    {
        uint id;
        uint number;
        string colour;
        string cardType;
    }

    struct Bet
    {
        bytes32 blindedPredict;
        uint amount;
    }

    uint public maxNoOfCards = 52;
    uint private noOfUnopenedCards = 52;

    // Address of the game host. Money goes to them if draw
    address payable public beneficiary;

    // Time tracking
    uint public biddingEnd;
    uint public revealEnd;
    bool public ended;

    // The deck/burn is defined as true/false on indices of deck.
    mapping(uint => Card) public deck;
    mapping(uint => bool) private burn;

    // To map the bid made to the address that made it
    mapping(address => Bet) public bets;

    /// Modifiers are a convenient way to validate inputs to
    /// functions. `onlyBefore` is applied to `bid` below:
    /// The new function body is the modifier's body where
    /// `_` is replaced by the old function body.
    modifier onlyBefore(uint _time) { require(now < _time); _; }
    modifier onlyAfter(uint _time) { require(now > _time); _; }

    constructor(
        uint _biddingTime,
        uint _revealTime,
        address payable _beneficiary
    ) public 
    {
        uint[] memory unopenedCards = new uint[](maxNoOfCards);
        bool[] memory burnDeck = new bool[](maxNoOfCards)
        beneficiary = _beneficiary;
        biddingEnd = now + _biddingTime;
        revealEnd = biddingEnd + _revealTime;
    }

    /// Place a blinded bet with `_blindedPredict` =
    /// keccak256(abi.encodePacked(value, fake, secret)).
    function bet(bytes32 _blindedPredict)
        public
        payable
        onlyBefore(biddingEnd)
    {
        bets[msg.sender] = Bet({
            blindedPredict: _blindedPredict,
            amount: msg.value
        }));
    }

    /// Reveal your blinded bets.
    function reveal(
        uint memory _amount,
        uint memory _prediction,
        bytes32 memory _secret
    )
        public
        onlyAfter(biddingEnd)
        onlyBefore(revealEnd)
    {
        uint refund;
        Bet storage betToCheck = bets[msg.sender];
        (uint amount, uint prediction, bytes32 secret) = (_amount, _prediction, _secret);
        if (betToCheck.blindedPredict == keccak256(prediction, secret)) // Need to check this works
        {
            if (correctPrediction(prediction)) 
            {
                refund = 2*betToCheck.amount;
            }
        }
        betToCheck.blindedPredict = bytes32(0);
        msg.sender.transfer(refund);
    }

    function correctPrediction(uint prediction) internal 
            returns (bool success) 
    {
        
    }

    function pickCard() 
    {
        
    }

    function random() private view returns (uint8) 
    {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)))%52);
    }

    // This is an "internal" function which means that it
    // can only be called from the contract itself (or from
    // derived contracts).
    function placeBid(address bidder, uint value) internal
            returns (bool success)
    {
        if (value <= highestBid) {
            return false;
        }
        if (highestBidder != address(0)) {
            // Refund the previously highest bidder.
            pendingReturns[highestBidder] += highestBid;
        }
        highestBid = value;
        highestBidder = bidder;
        return true;
    }

    /// Withdraw a bid that was overbid.
    function withdraw() public {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `transfer` returns (see the remark above about
            // conditions -> effects -> interaction).
            pendingReturns[msg.sender] = 0;

            msg.sender.transfer(amount);
        }
    }

    /// End the auction and send the highest bid
    /// to the beneficiary.
    function auctionEnd()
        public
        onlyAfter(revealEnd)
    {
        require(!ended);
        emit AuctionEnded(highestBidder, highestBid);
        ended = true;
        beneficiary.transfer(highestBid);
    }
}
