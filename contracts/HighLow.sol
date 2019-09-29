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
        noAction,
        endRound
    }
    
    Stages public stage = Stages.betStage;
    uint public creationTime = now;
    
    
    
    
    
    
    
    
    
    
    
    
    
  
  
  
  
  
    
    
    // ============ For timing the various stages =============
    // Design pattern taken from https://solidity.readthedocs.io/en/v0.5.0/common-patterns.html#state-machine
    
 
    // We need a modifier to disallow certain functions in certain Stages
    // For instance, we should not be able to call the reveal() function while betting is in progress.
    // So, we create a modifier for it.
    modifier atStage(Stages _stage) { require( stage == _stage, "Function cannot be called at this time." ); _; }
    
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
        if (stage == Stages.betStage && now >= creationTime + 30) {
            nextStage();
        }
        if (stage == Stages.revealStage && now >= creationTime + 40) {
            nextStage();
        }
        _;    
    }
    
    // !!!!!!!!!!!!!!!!!!!!! For timing the various stages !!!!!!!!!!!!!!!!!!!!!!!!!
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    constructor (address payable _beneficiary) 
        public
    {
           maxNoOfCards = 52;
           noOfBets = 0;
           noOfUnopenedCards = maxNoOfCards;
           
           beneficiary = _beneficiary;
           stage = Stages.endRound;
           
           setCards();
           pickCard();
    }
    
    
    function initializeRound() 
        public 
        timedTransitions
        atStage(Stages.endRound)
    {
        creationTime = now;
        stage = Stages.betStage;
        placedCard = hiddenCard;
        pickCard();
        if (noOfUnopenedCards <= 10) 
        {
            setCards();
        }
        // set time 
        // set stage 
        // if cards < 10 reset 
        // hidden becomes placed 
        // pick new hidden 
    }
 
    
    
    
    
    
    
    
    
    
    
    
    
    
  
  
  
  
  
    
    
    // Random number generator. Due to the constraints of blockchain TM, not perfectly random: but it will do
    // Generates a random number between 0 and 51.
    // This number is used to pick a card in the pickCard() function
    function random() private view returns (uint8) { return uint8(uint256(keccak256(abi.encodePacked(now, block.difficulty))) % maxNoOfCards); }
    
    // Initializes a new set of cards.
    // Resets burn deck.
    // Resets noOfUnopenedCards
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
    
    // Picks a random card to be used for the round.
    function pickCard() 
        internal 
    {
        uint8 val = random();
        while(burn[val])
            val = (val + 1) % maxNoOfCards;
        burn[val] = true;
        hiddenCard = deck[val];
        noOfUnopenedCards--;
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
        noOfBets++;
        // beneficiary.transfer(msg.value);
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
        public
    {
        // emit RoundEnded();
        stage = Stages.endRound;
        initializeRound();
    }
    
}