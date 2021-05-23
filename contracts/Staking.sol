// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Interfaces/IERC20.sol";
import "./Interfaces/IStaking.sol";

contract Staking is IERC20 {

    uint256 public total_amount_staked;
    uint256 public total_amount_created;

    address owner;
    address payable[] public stakers;

    struct Depositer {
        uint amount_deposited;   
        uint256 time;
        bool registered;
    }

    mapping(address => Depositer) public DepositerInfo;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    string public name = "MemCoin";
    string public symbol = "MC";
    uint8 public decimals = 18;
    uint256 public totalSupply = 100000000000000000000000000;

   modifier onlyOwner {
        require(msg.sender == owner, "Only callable by Owner");
        _;
   }

    constructor() public {
        owner = msg.sender;
        total_amount_staked = 0;
    }

    function stake_eth() public payable returns (bool){
        require(msg.sender != address(0) , "Sender is null");

        if (DepositerInfo[msg.sender].registered != true) {
            stakers.push(msg.sender);
            DepositerInfo[msg.sender].registered = true;
        }

        DepositerInfo[msg.sender].amount_deposited += msg.value;
        DepositerInfo[msg.sender].time = block.timestamp;

        total_amount_staked += msg.value;

        return (true);
    }

    function unstake_eth(address payable _staker, uint256 _amount) public returns (bool) {
        require(msg.sender != address(0), "Sender is null");
        require(msg.sender == _staker , "Caller is not staker");
        require(DepositerInfo[msg.sender].amount_deposited != 0, "No Funds Staked");
        require(_amount <= DepositerInfo[msg.sender].amount_deposited, "Not enough eth staked");

        _staker.transfer(_amount);
        DepositerInfo[msg.sender].amount_deposited -= _amount;
        
        if (DepositerInfo[msg.sender].amount_deposited <= 0) {
            DepositerInfo[msg.sender].registered = false;
        }

        return (true);
    }

    function payout_coins() public onlyOwner returns (bool) {
        uint bp;
        uint amount_pay_out;
        address payable depositerAddress;

        for (uint256 i = 0; i < stakers.length; i++) 
        {
            bp = (DepositerInfo[stakers[i]].amount_deposited * 100000) / total_amount_staked;
            //1000 is the total amount of coins 
            amount_pay_out = ((1000 * bp) / 100000) * 1000000000000000000;
            
            depositerAddress = stakers[i];
            _mint(depositerAddress, amount_pay_out);
        } 
        total_amount_created += 1000000000000000000000;
    }

    function _mint(address _to, uint256 _amount) internal returns (bool) {
        require(totalSupply - _amount >= 0, "Minting Over Total Supply");
        require(msg.sender == owner, "caller is not owner");

        balanceOf[_to] += _amount;
        totalSupply -= _amount;

        emit Transfer(address(0), _to, _amount);
        return (true);

    }
    function approve(address _spender, uint256 _value) external returns (bool) {
        require(_spender != address(0), "Address is Null");
        require(balanceOf[msg.sender] >= _value, "Insuffectin Funds / Coins");

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return (true);
    }

    function transfer(address _to, uint256 _value) external returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Insuffectin Funds / Coins");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return (true);
    }

    function transferFrom(address _from, address _to, uint256 _value ) external returns (bool) {
        require(_value <= allowance[_from][_to], "Transaction is not Approved");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
        return (true);
    }

}