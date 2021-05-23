// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IStaking {

    function stake_eth() external payable returns(bool);

    function unstake_eth(address payable _staker, uint256 _amount) external returns(bool);

    function paytout_coins() external view returns(bool);
}