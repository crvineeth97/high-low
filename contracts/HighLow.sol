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
        // id is used to reference on mapping

        // number is the number on the card. It ranges from 1 - 13
        // 1 = Ace, 2 - 10 = the 2 - 10 cards
        // 11, 12, 13 = the Joker, Queen and King

        // colour is either a 0 or 1
        // Let us say that 0 = Red and 1 = Black

        // cardType ranges from 0 - 3
        // Let us say that 0 = Diamonds, 1 = Hearts if colour is 0
        // 0 = Clubs and 1 = Spades if colour is 1

        uint8 id;
        uint8 number;
        bool colour;
        bool cardType;
    }

    // A bet comprises the hashed prediction, and the amount
    // put forward in the bet.
    struct Bet
    {
        bytes32 blindedPrediction;
        uint amount;
    }

    event cardPlaced(string description);
    event RoundEnded();

    // The burn is defined as true/false on indices of deck.
    mapping(uint8 => Card) public deck;
    mapping(uint8 => bool) private burn;

    // To map the bid made to the address that made it
    mapping(address => Bet) public bets;

    Card public placedCard;
    Card private hiddenCard;

    uint8 public maxNoOfCards;
    uint8 public noOfBets;
    uint8 private noOfUnopenedCards;

    // Address of the game host. Money goes to them if draw
    address payable public beneficiary;
    // The game can in a single round, be in 4 Stages
    enum Stages
    {
        betStage,
        revealStage,
        refund,
        endRound
    }

    Stages public stage = Stages.betStage;
    uint public creationTime = now;

    // ============ For timing the various stages =============
    // Design pattern taken from https://solidity.readthedocs.io/en/v0.5.0/common-patterns.html#state-machine

    // We need a modifier to disallow certain functions in certain Stages
    // For instance, we should not be able to call the reveal() function while betting is in progress.
    // So, we create a modifier for it.
    modifier atStage(Stages _stage)
    {
        require
        (
            stage == _stage,
            "Function cannot be called at this time."
        );
        _;
    }

    // Going from Stage 0 to Stage 1 is easy enough, and from Stage 1 to 2.
    // This does not store the logic behind limiting switching. It just sets up a sequence.
    function nextStage()
        internal
    {
        stage = Stages(uint(stage) + 1);
    }

    // Here we have the times at which the nextStage() function is called.
    // Essentially, this makes the program tick. When calling a function, we run this modifier. If the conditions
    //  are satisfied (the time elapsed is sufficient to move to the next stage), then we switch to the next stage
    //  and then the function works as it is required to.
    modifier timedTransitions()
    {
        if (stage == Stages.betStage && now >= creationTime + 6 seconds)
            nextStage();
        if (stage == Stages.revealStage && now >= creationTime + 15 seconds)
            nextStage();
        // The other stages transition by transaction
        _;
    }

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
    constructor (address payable _beneficiary)
        public
    {
        maxNoOfCards = 52;
        beneficiary = _beneficiary;
        // initializeRound will pick a hidden card
        stage = Stages.endRound;
        initializeRound();
        // Will pick a placed card
        pickCard(true);
        emit cardPlaced(string(abi.encodePacked("The card currently placed is the ", getPlacedCard())));
    }

    // Initializes a new set of cards.
    // Resets burn deck.
    // Resets noOfUnopenedCards
    function initializeRound()
        internal
        timedTransitions
        atStage(Stages.endRound)
    {
        require(noOfBets == 0, "Round has not yet ended => New round can't be initialized");
        if (noOfUnopenedCards <= 10)
            setCards();
        placedCard = hiddenCard;

        emit cardPlaced(string(abi.encodePacked("The card currently placed is the ", getPlacedCard())));
        creationTime = now;
        stage = Stages.betStage;
        pickCard(false);
    }

    // Random number generator. Due to the constraints of blockchain TM, not perfectly random: but it will do
    // Generates a random number between 0 and 51.
    // This number is used to pick a card in the pickCard() function
    function random()
        internal
        view
        returns (uint8)
    {
        return uint8(uint256(keccak256(abi.encodePacked(now, block.difficulty))) % maxNoOfCards);
    }

    function cardNoToStr(uint8 i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (i == 1)
            return "Ace";
        else if (i == 2)
            return "Two";
        else if (i == 3)
            return "Three";
        else if (i == 4)
            return "Four";
        else if (i == 5)
            return "Five";
        else if (i == 6)
            return "Six";
        else if (i == 7)
            return "Seven";
        else if (i == 8)
            return "Eight";
        else if (i == 9)
            return "Nine";
        else if (i == 10)
            return "Ten";
        else if (i == 11)
            return "Jack";
        else if (i == 12)
            return "Queen";
        else if (i == 13)
            return "King";
        else
            return "Ignore emit";
    }

    function getPlacedCard()
        public
        view
        returns (string memory)
    {
        string memory cardType;
        if (placedCard.colour == false)
        {
            if (placedCard.cardType == false)
                cardType = "diamonds";
            else
                cardType = "hearts";
        }
        else
        {
            if (placedCard.cardType == false)
                cardType = "clubs";
            else
                cardType = "spades";
        }
        return string(abi.encodePacked(cardNoToStr(placedCard.number), " of ", cardType));
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

    function setCards()
        internal
    {
        for (uint8 i = 0; i < maxNoOfCards; i++)
        {
            // (i % 13) + 1 will give the card numbers in range 1 - 13
            // (i / 26) != 0 will give bool 0 if i / 26 is 0
            deck[i] = Card(i, (i % 13) + 1, (i / 26) != 0, ((i / 13) % 2) != 0);
            burn[i] = false;
        }
        noOfUnopenedCards = 52;
    }

    function bet(bytes32 _blindedPredict)
        public
        payable
        timedTransitions
        atStage(Stages.betStage)
    {
        require(bets[msg.sender].amount == 0, "You have already placed a bet");
        require(msg.value != 0, "You cannot place a bet with 0 ether");
        bets[msg.sender] = Bet({
            blindedPrediction: _blindedPredict,
            amount: msg.value
        });
        // beneficiary.transfer(msg.value);
        noOfBets++;
    }

    function reveal(bool _prediction, bytes32 _secret)
        public
        timedTransitions
        atStage(Stages.revealStage)
    {
        uint refund = 0;
        Bet storage betToCheck = bets[msg.sender];
        require(betToCheck.amount > 0, "No bet from this address");
        (bool prediction, bytes32 secret) = (_prediction, _secret);
        if (betToCheck.blindedPrediction == keccak256(abi.encodePacked(prediction, secret))) // Need to check this works
            if (correctPrediction(prediction, betToCheck.amount))
                refund = 2 * betToCheck.amount;
        betToCheck.blindedPrediction = bytes32(0);
        betToCheck.amount = 0;
        msg.sender.transfer(refund);
        noOfBets--;
        if (noOfBets == 0)
            roundEnd();
    }

    // returns true if the prediction is true, false otherwise. In case of draw,
    // gives money to beneficiary
    function correctPrediction(bool prediction, uint amt)
        internal
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

    function roundEnd()
        internal
    {
        // This function is called after all bets are revealed
        emit RoundEnded();
        stage = Stages.endRound;
        initializeRound();
    }
}
