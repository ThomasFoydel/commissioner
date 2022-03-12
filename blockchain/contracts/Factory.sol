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
    event RewardClaimed(address indexed claimer, uint256 indexed votesClaimed, address indexed commission);
    event WinnerTipped(address indexed winningAuthor, uint256 amount, address indexed commission, address indexed tipper);
    event VoteSubmitted(
        address indexed author,
        address indexed voter,
        uint256 amount,
        address indexed commission
    );

    function createCommission(string memory prompt, uint256 _minTime) payable public {
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

    function paginatedCommissions(uint32 _start, uint8 _pageSize) public view returns (address[] memory) {
        require(_pageSize <= 100);
        uint32 start = _start < 0 ? 0 : _start >= commissionCount ? commissionCount - 1 : _start;
        uint32 finish = _start + _pageSize > commissionCount ? commissionCount : _start + _pageSize;
        uint32 counter;
        address[] memory commissionPage = new address[](finish - start);
        for (uint32 i = start; i < finish; i++) {
            commissionPage[counter] = deployedCommissions[i];
            counter++;
        }
        return commissionPage;
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
    function _rewardClaimed(address _claimer, uint256 _votesClaimed) external commissionOnly {
        emit RewardClaimed(_claimer, _votesClaimed, msg.sender);
    }
    function _winnerTipped(address _winningAuthor, uint256 _amount) external commissionOnly {
        emit WinnerTipped(_winningAuthor, _amount, msg.sender, tx.origin);
    }
}
