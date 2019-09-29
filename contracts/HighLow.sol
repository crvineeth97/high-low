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
        uint8 id; // Used to reference on mapping
        // number is the number on the card. It ranges from 1 - 13
        // 1 = Ace, 2 - 10 = the 2 - 10 cards
        // 11, 12, 13 = the Joker, Queen and King
        uint8 number;
        // colour is either a 0 or 1
        // Let us say that 0 = Red and 1 = Black
        uint8 colour;
        // cardType ranges from 0 - 3
        // Let us say that 0 = Diamonds, 1 = Hearts if colour is 0
        // 0 = Clubs and 1 = Spades if colour is 1
        uint8 cardType;
    }

    // A bet comprises the hashed prediction, and the amount
    // put forward in the bet.
    struct Bet
    {
        bytes32 blindedPrediction;
        uint amount;
    }

    // The burn is defined as true/false on indices of deck.
    mapping(uint8 => Card) public deck;
    mapping(uint8 => bool) private burn;

    // To map the bet made to the address that made it
    mapping(address => Bet) public bets;

    Card public placedCard;
    Card private hiddenCard;

    uint8 public maxNoOfCards;
    uint8 private noOfUnopenedCards;

    // Address of the game host. Money goes to them if draw
    address payable public beneficiary;

    // Time tracking
    uint public biddingEnd;
    uint public revealEnd;
    uint32 public biddingTime;
    uint32 public revealTime;

    modifier onlyBefore(uint _time) {require(now < _time, "Before Time error"); _;}
    modifier onlyAfter(uint _time) {require(now > _time, "After time error"); _;}


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
    constructor
    (
        uint32 _biddingTime,
        uint32 _revealTime,
        address payable _beneficiary
    )
    public
    {
        maxNoOfCards = 52;
        biddingTime = _biddingTime;
        revealTime = _revealTime;
        beneficiary = _beneficiary;
        // initializeRound will pick a hidden card
        initializeRound(true);
        // Will pick a placed card
        pickCard(true);
    }

    function initializeRound(bool first)
        internal
    {
        if (!first) {
            placedCard = hiddenCard;
            pickCard(false);
            biddingEnd = now + biddingTime;
            revealEnd = biddingEnd + revealTime;
            if (noOfUnopenedCards <= 10)
                setCards();
        }
        else {
            setCards();
        }
    }

    function setCards() internal
    {
        for (uint8 i = 0; i < maxNoOfCards; i++)
        {
            // (i % 13) + 1 will give the card numbers in range 1 - 13
            // (i / 26) will give 0 or 1
            // (i / 13) will give 0, 1, 2, 3
            deck[i] = Card(i, (i % 13) + 1, (i / 26), (i / 13));
            burn[i] = false;
        }
        noOfUnopenedCards = 52;
    }

    // Takes a new card out. If first, puts it in placedCard directly.
    function pickCard(bool first)
        internal
    {
        uint8 val = random();
        while(burn[val])
            val = (val + 1) % maxNoOfCards;
        burn[val] = true;
        if (first)
            placedCard = deck[val];
        else
            hiddenCard = deck[val];
        noOfUnopenedCards--;
    }

    /// Place a blinded bet with `_blindedPredict` =
    /// keccak256(abi.encodePacked(prediction, secret)).
    function bet(bytes32 _blindedPredict)
        public
        payable
        onlyBefore(biddingEnd)
    {
        bets[msg.sender] = Bet({
            blindedPrediction: _blindedPredict,
            amount: msg.value
        });
        beneficiary.transfer(msg.value);
    }

    /// Reveal your blinded bets.
    function reveal(
        bool _prediction,
        bytes32 _secret
    )
        public
        onlyAfter(biddingEnd)
        onlyBefore(revealEnd)
    {
        uint refund;
        Bet storage betToCheck = bets[msg.sender];
        (bool prediction, bytes32 secret) = (_prediction, _secret);
        if (betToCheck.blindedPrediction == keccak256(abi.encodePacked(prediction, secret))) // Need to check this works
            if (correctPrediction(prediction, betToCheck.amount))
                refund = 2 * betToCheck.amount;
        betToCheck.blindedPrediction = bytes32(0);
        msg.sender.transfer(refund);
    }

    // returns true if the prediction is true, false otherwise. In case of draw,
    // gives money to beneficiary
    function correctPrediction(bool prediction, uint amt)
        internal
        onlyAfter(biddingEnd)
        onlyBefore(revealEnd)
        returns (bool success)
    {
        // low is 0, high is 1
        bool realval;
        if (hiddenCard.number < placedCard.number)
            realval = false;
        else if (hiddenCard.number > placedCard.number)
            realval = true;
        else
            beneficiary.transfer(amt);

        return prediction == realval;
    }

    function random() private view returns (uint8)
    {
        return uint8(uint256(keccak256(abi.encodePacked(now, block.difficulty))) % maxNoOfCards);
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

