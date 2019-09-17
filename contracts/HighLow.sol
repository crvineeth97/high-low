pragma solidity ^0.5.0;

contract HighLow
{
    
    // =========== Initialising variables ===========
    // In this part, we focus on initialising variables/structs that 
    // will be of use later. So, we init Card and Bet structs,
    // mappings for deck and burn, something for the "placed card",
    // Number of cards, times, etc.


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
    Card private hiddenCard;

    uint public maxNoOfCards;
    uint private noOfUnopenedCards;

    // Address of the game host. Money goes to them if draw
    address payable public beneficiary;

    // Time tracking
    uint public biddingEnd;
    uint public revealEnd;
    uint public biddingTime;
    uint public revealTime;
    



    modifier onlyBefore(uint _time) { require(now < _time); _; }
    modifier onlyAfter(uint _time) { require(now > _time); _; }



    // =========== Functional ===========
    // This is where the logic of the program goes. As a brief sanity check/
    // solution overview, this is what happens in the program:
    // - constructor: inits times, beneficiaries
    // - We make available a function for picking a random card. This card is
    //  stored in placedCard
    // - users can use function "bet" to place their bets. They give a bet amount,
    //  and a hash of secretkey + prediction. They are allowed one bet.
    // - After time expires, the bets are verified: each user verify()s with their
    //  OG prediction, amount bet, and secretkey. function checks if their prediction
    // was correct or not, and announces a reward accordingly. (0 for losing, 2x 
    // for winning)
    // - With this a new card has been generated. Next round is started by 
    //  reinitialising the times
    
    // constructor initialising
    // - times
    // - all cards in deck
    // - initial newcard
    constructor(
        uint _biddingTime,
        uint _revealTime,
        address payable _beneficiary
    ) public 
    {
        maxNoOfCards = 52;
        noOfUnopenedCards = 52;


        beneficiary = _beneficiary;
        biddingEnd = now + _biddingTime;
        revealEnd = biddingEnd + _revealTime;

        biddingTime = _biddingTime;
        revealTime = _revealTime;

        for (uint i = 0; i < maxNoOfCards; i++) 
        {
            uint t1 = i/26;
            uint t2 = i/13;
            
            deck[i] = Card(i, (i+1)%13, t1, t2);
            burn[i] = false;
        }
        
        pickCard(true);
    }

    /// Place a blinded bet with `_blindedPredict` =
    /// keccak256(abi.encodePacked(prediction, secret)).
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
        uint _prediction,
        bytes32 _secret
    )
        public
        onlyAfter(biddingEnd)
        onlyBefore(revealEnd)
    {
        uint refund;
        Bet storage betToCheck = bets[msg.sender];
        (uint prediction, bytes32 secret) = (_prediction, _secret);
        if (betToCheck.blindedPredict == keccak256(abi.encodePacked(prediction, secret))) // Need to check this works
        {
            if (correctPrediction(prediction, betToCheck.amount)) 
            {
                refund = 2*betToCheck.amount;
            }
        }
        betToCheck.blindedPredict = bytes32(0);
        msg.sender.transfer(refund);
    }

    // returns true if the prediction is true, false otherwise. In case of draw,
    // gives money to beneficiary
    function correctPrediction(uint prediction, uint amt) 
        internal 
        onlyAfter(biddingEnd)
        onlyBefore(revealEnd)
        returns (bool success)
    {
        // low is 0, high is 1
        uint realval = 2;
        if (hiddenCard.number < placedCard.number) 
        {
            realval = 0;
        }
        else if (hiddenCard.number > placedCard.number) {
            realval = 1;
        }
        else {
            beneficiary.transfer(amt);
        }

        return  prediction == realval;
    }

    // Takes a new card out. If first, puts it in placedCard directly.
    function pickCard(bool first)
        public
    {
        uint val = random();
        while(burn[val]) 
        {
            val++;
        } 
        burn[val] = true;
        if (first) 
        {
            placedCard = deck[val];
        }
        else 
        {
            hiddenCard = deck[val];
        }
        noOfUnopenedCards--;
    }

    function random() private view returns (uint) 
    {
        return uint(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)))%52);
    }
    
    function reset()
        public
        onlyAfter(revealEnd)
    {
        placedCard = hiddenCard;
        pickCard(false);
        biddingEnd = now + biddingTime;
        revealEnd = biddingEnd + revealTime;

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
    //         // Refund the previously highest bidder .
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

