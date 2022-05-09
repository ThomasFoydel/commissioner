// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./SafeMath.sol";

interface IFactory {
    function _voteSubmitted(address _author, address _voter, uint256 _value) external;
    function _rewardAdded(address _sender, uint256 _value) external;
    function _commissionCancelled() external;
    function _entrySubmitted(string memory _ipfsPath, address _author) external;
    function _winnerChosen(address _winningAuthor, uint256 _reward) external;
    function _winnerTipped(address _winningAuthor, uint256 _amount) external;
    function _commissionerTipped(address _winningAuthor, uint256 _amount) external;
}

contract Commission {
    using SafeMath for uint256;
    struct Entry {
        address author;
        string ipfsPath;
    }

    address payable public commissioner;
    address payable winningAuthor;
    address payable foreRunner;
    uint256 highestVoteSoFar;
    uint256 creation;
    uint256 minTime;
    uint256 public reward;
    uint32 public entryCount;
    bool public active = true;
    bool canBeCancelled = true;
    string public prompt;
    IFactory public factory;
    mapping(address => bool) entered;
    mapping(address => uint256) public votes;
    Entry[] public entries;

    constructor(
        address _commissioner,
        uint256 _reward,
        string memory _prompt,
        uint256 _minTime
    ) payable {
        factory = IFactory(msg.sender);
        commissioner = payable(_commissioner);
        reward = _reward;
        prompt = _prompt;
        creation = block.timestamp;
        minTime = _minTime;
    }

    modifier auth() {
        require(msg.sender == commissioner, "Not authenticated :(");
        _;
    }

    modifier minTimePassed() {
        require(block.timestamp > creation + minTime);
        _;
    }
    modifier minTimeAndTwoDaysPassed() {
        require(block.timestamp > creation + minTime + 172800);
        _;
    }

    modifier finished() {
        require(active == false, "No one has won yet!");
        _;
    }
    modifier ongoing() {
        require(active == true, "This commission has already ended");
        _;
    }

    function getForerunner() public view returns (address) {
        require(highestVoteSoFar > 0, "No votes yet");
        return foreRunner;
    }

    function addReward() public payable {
        if (msg.sender != commissioner && msg.value > 0) canBeCancelled = false;
        reward = reward.add(msg.value);
        factory._rewardAdded(msg.sender, msg.value);
    }

    function cancel() public auth ongoing {
        require(
            canBeCancelled,
            "Contract cannot be cancelled once entries have been submitted"
        );
        active = false;
        if (address(this).balance > 0) {
            commissioner.transfer(address(this).balance);
        }
        factory._commissionCancelled();
    }

    function submitEntry(string memory _ipfsPath)
        public
        ongoing
    {
        require(entered[msg.sender] == false, "You have already entered");
        require(
            msg.sender != commissioner,
            "You cannot enter your own commission"
        );
        entered[msg.sender] = true;
        if (canBeCancelled) canBeCancelled = false;
        Entry memory newEntry = Entry({
            author: msg.sender,
            ipfsPath: _ipfsPath
        });
        entries.push(newEntry);
        entryCount++;
        factory._entrySubmitted(_ipfsPath, msg.sender);
    }

    function chooseWinner() external ongoing auth minTimePassed {
        _carryOutChooseWinner(commissioner);
    }

    function chooseWinnerPublic() external ongoing minTimeAndTwoDaysPassed {
        _carryOutChooseWinner(msg.sender);
    }

    function _carryOutChooseWinner(address caller) internal {
        active = false;
        uint256 tenpercent = reward.div(10);
        payable(caller).transfer(tenpercent);
        winningAuthor = foreRunner;
        reward = reward.sub(tenpercent);
        winningAuthor.transfer(reward.add(votes[winningAuthor]));
        factory._winnerChosen(winningAuthor, reward);
    }

    function tipWinner() public payable finished {
        winningAuthor.transfer(msg.value);
        factory._winnerTipped(winningAuthor, msg.value);
    }

    function tipCommissioner() public payable finished {
        commissioner.transfer(msg.value);
        factory._commissionerTipped(commissioner, msg.value);
    }

    function getWinningAuthor() public view finished returns (address) {
        return winningAuthor;
    }

    function vote(address _author) public payable ongoing {
        require(msg.value > 0, "Must send value to vote for an entry");
        require(msg.sender != _author, "You cannot vote for yourself");
        require(entered[_author] == true, "Entry not found");
        votes[_author] = votes[_author].add(msg.value);
        if (votes[_author] > highestVoteSoFar) {
            highestVoteSoFar = votes[_author];
            foreRunner = payable(_author);
        }
        factory._voteSubmitted(_author, msg.sender, msg.value);
        payable(_author).transfer(msg.value);
    }
}
