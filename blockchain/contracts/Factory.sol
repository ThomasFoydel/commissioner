// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./Commission.sol";

contract Factory {
    address[] public deployedCommissions;
    address public deployer;
    uint32 public commissionCount;
    mapping(address => bool) public commissions;

    constructor () {
        deployer = msg.sender;
    }

    modifier commissionOnly() {
        require(commissions[msg.sender]);
        _;
    }

    event CommissionCreated(
        address indexed commissioner, 
        uint indexed timestamp, 
        uint reward, 
        string prompt, 
        address commission,
        uint minTime
    );
    event RewardAdded(address indexed sender, uint256 indexed value, address indexed commission);
    event CommissionCancelled(address indexed commission, uint256 indexed timestamp);
    event EntrySubmitted(address indexed author,string ipfsPath, address indexed commission);
    event WinnerChosen(address indexed winningAuthor, uint256 indexed reward, address indexed commission);
    event WinnerTipped(address indexed winningAuthor, uint256 amount, address indexed commission, address indexed tipper);
    event CommissionerTipped(address indexed commissioner, uint256 amount, address indexed commission, address indexed tipper);
    event VoteSubmitted(
        address indexed author,
        address indexed voter,
        uint256 amount,
        address indexed commission
    );

    function createCommission(string memory prompt, uint256 _minTime) payable public {
        require(_minTime > 172800); // two days minimum
        Commission newCommission = (new Commission){value: msg.value}(msg.sender, msg.value, prompt, _minTime);
        address payable commissionAddress = payable(address(newCommission));
        deployedCommissions.push(commissionAddress);
        commissionCount++;
        emit CommissionCreated(msg.sender, block.timestamp, msg.value, prompt, commissionAddress, _minTime);
        commissions[commissionAddress] = true;
    }  

    function getDeployedCommissions() public view returns (address[] memory) {
        return deployedCommissions;
    }

    function _voteSubmitted(address _author, address _voter, uint256 _value) external commissionOnly {
        emit VoteSubmitted(_author, _voter, _value, msg.sender);
    }

    function _rewardAdded(address _sender, uint256 _value) external commissionOnly {
        emit RewardAdded(_sender, _value, msg.sender);
    }

    function _commissionCancelled() external commissionOnly {
        emit CommissionCancelled(msg.sender, block.timestamp);
    }

    function _entrySubmitted(string memory _ipfsPath, address _author) external commissionOnly {
        emit EntrySubmitted(_author, _ipfsPath, msg.sender);
    }

    function _winnerChosen(address _winningAuthor, uint256 _reward) external commissionOnly {
        emit WinnerChosen(_winningAuthor, _reward, msg.sender);
    }

    function _winnerTipped(address _winningAuthor, uint256 _amount) external commissionOnly {
        emit WinnerTipped(_winningAuthor, _amount, msg.sender, tx.origin);
    }

    function _commissionerTipped(address _commissioner, uint256 _amount) external commissionOnly {
        emit CommissionerTipped(_commissioner, _amount, msg.sender, tx.origin);
    }
}
