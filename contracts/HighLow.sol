pragma solidity ^0.5.0;

contract HighLow
{

    // Represent each card as a struct
    struct Card
    {
        uint id; // Used to reference on mapping
        uint number;// These three params are standard card features
        uint colour;
        uint cardType;
    }

    // A bet comprises the hashed prediction, and the amount
    // put forward in the bet.
    struct Bet
    {
        bytes32 blindedPredict;
        uint amount;
    }

    // The deck/burn is defined as true/false on indices of deck.
    mapping(uint => Card) public deck;
    mapping(uint => bool) private burn;

    // To map the bid made to the address that made it
    mapping(address => Bet) public bets;

    Card public placedCard;

    uint public maxNoOfCards = 52;
    uint private noOfUnopenedCards = 52;

    // Address of the game host. Money goes to them if draw
    address payable public beneficiary;

    // Time tracking
    uint public biddingEnd;
    uint public revealEnd;
    bool public ended;



    modifier onlyBefore(uint _time) { require(now < _time); _; }
    modifier onlyAfter(uint _time) { require(now > _time); _; }



    constructor(
        uint _biddingTime,
        uint _revealTime,
        address payable _beneficiary
    ) public 
    {

        beneficiary = _beneficiary;
        biddingEnd = now + _biddingTime;
        revealEnd = biddingEnd + _revealTime;

        for (uint i = 0; i < maxNoOfCards; i++) 
        {
            uint t1 = i/26;
            uint t2 = i/13;
            
            deck[i] = Card(i, (i+1)%13, t1, t2);
            burn[i] = false;
        }
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
        });
    }

    /// Reveal your blinded bets.
    function reveal(
        uint _amount,
        uint _prediction,
        bytes32 _secret
    )
        public
        onlyAfter(biddingEnd)
        onlyBefore(revealEnd)
    {
        uint refund;
        Bet storage betToCheck = bets[msg.sender];
        (uint amount, uint prediction, bytes32 secret) = (_amount, _prediction, _secret);
        if (betToCheck.blindedPredict == keccak256(abi.encodePacked(prediction, secret))) // Need to check this works
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
        // low is 0, high is 1
        Card memory oldpick = placedCard;
        pickCard();
        uint realval = 2;
        if (placedCard.number < oldpick.number) 
        {
            realval = 0;
        }
        else if (placedCard.number > oldpick.number) {
            realval = 1;
        }
        else {
        
        }

        return  prediction == realval;

    }

    function pickCard() private
    {
        uint8 val = random();
        while(burn[val]) 
        {
            val++;
        }
        placedCard = deck[val]; 
    }

    function random() private view returns (uint8) 
    {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)))%52);
    }

    // This is an "internal" function which means that it
    // can only be called from the contract itself (or from
    // derived contracts).
    // function placeBid(address bidder, uint value) internal
    //         returns (bool success)
    // {
    //     if (value <= highestBid) {
    //         return false;
    //     }
    //     if (highestBidder != address(0)) {
    //         // Refund the previously highest bidder.
    //         pendingReturns[highestBidder] += highestBid;
    //     }
    //     highestBid = value;
    //     highestBidder = bidder;
    //     return true;
    // }

// }

    /// End the auction and send the highest bid
    /// to the beneficiary.
    // function auctionEnd()
    //     public
    //     onlyAfter(revealEnd)
    // {
    //     require(!ended);
    //     emit AuctionEnded(highestBidder, highestBid);
    //     ended = true;
    //     beneficiary.transfer(highestBid);
    // }
}

