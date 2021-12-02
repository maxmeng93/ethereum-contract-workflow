// SPDX-License-Identifier: MIT
import "./SafeMath.sol";

pragma solidity ^0.8.5;

contract Project {
    using SafeMath for uint256;

    struct Payment {
        string description;
        uint256 amount;
        address receiver;
        bool completed;
        mapping(address => bool) voters;
        uint256 voterCount;
    }

    address public owner;
    string public description;
    uint256 public minInvest;
    uint256 public maxInvest;
    uint256 public goal;
    uint256 public investorCount;
    mapping(address => uint256) public investors;

    Payment[] public payments;

    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    constructor(
        string memory _description,
        uint256 _minInvest,
        uint256 _maxInvest,
        uint256 _goal,
        address _owner
    ) public {
        description = _description;
        minInvest = _minInvest;
        maxInvest = _maxInvest;
        goal = _goal;
        owner = _owner;
    }

    function contribute() public payable {
        require(msg.value >= minInvest);
        require(msg.value <= maxInvest);

        uint256 newBalance = 0;
        newBalance = address(this).balance.add(msg.value);
        require(newBalance <= goal);

        investors[msg.sender] = msg.value;
        investorCount += 1;
    }

    function createPayment(
        string memory _description,
        uint256 _amount,
        address _receiver
    ) public ownerOnly {
        require(msg.sender == owner);

        Payment memory newPayment = Payment({
            description: _description,
            amount: _amount,
            receiver: _receiver,
            completed: false,
            voterCount: 0
        });

        payments.push(newPayment);
    }

    function approvePayment(uint256 index) public {
        Payment storage payment = payments[index];

        // must be investor to vote
        require(investors[msg.sender] > 0);

        // can not vote twice
        require(!payment.voters[msg.sender]);

        payment.voters[msg.sender] = true;
        payment.voterCount += 1;
    }

    function doPayment(uint256 index) public ownerOnly {
        require(msg.sender == owner);

        Payment storage payment = payments[index];

        require(!payment.completed);
        require(address(this).balance >= payment.amount);
        require(payment.investorCount > (investorCount / 2));

        payment.receiver.transfer(payment.amount);
        payment.completed = true;
    }
}
