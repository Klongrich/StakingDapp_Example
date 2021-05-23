import React, {useEffect, useState} from "react";
import Web3 from "web3";

import StakingABI from "./Staking.json";

const StakingdContractAddress = "0x4D43b5457835144cAf1D3aC526eFB75D44651218";
const ONE_ETHER = 1000000000000000000;

export default function Dapp() {

    const [walletAmount, setWalletAmount] = useState(0);
    const [totalAmountStaked, setTotalAmountStaked] = useState(0);
    const [amountStaked, setAmountStaked] = useState(0);
    const [memTokenBalance, setMemTokenBalance] = useState(0);
    const [currentPayout, setCurrentPayout] = useState(0);

    const [stakeAmount, setStakeAmount] = useState(0);
    const [unstakeAmount, setUnstakeAmount] = useState(0);

    async function getWalletAmount() {

      async function loadWeb3() {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          return true;
        } else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
          return true;
        } else {
          return false;
        }
      }
  
      var wallet = await loadWeb3();
  
      if (wallet) {
        const web3 = window.web3;
  
        const accounts = await web3.eth.getAccounts();
        const address = { account: accounts[0] }.account;
  
        if (address) {
          web3.eth.getBalance(address, function (error, wei) {
            if (!error) {
              var balance = web3.utils.fromWei(wei, "ether");
              setWalletAmount(balance.substring(0, 4));
            }
          });
        }
      }
    }

    async function get_MemToken_balance() {
        const web3 = window.web3;  
        const accounts = await web3.eth.getAccounts();

        const StakingContract = new web3.eth.Contract(
            StakingABI.abi,
            StakingdContractAddress
        )
        
        await StakingContract.methods.balanceOf(accounts[0]).call(function(error, result){
            // console.log("MemCoin Balance: " + result);
            setMemTokenBalance(result / ONE_ETHER);
        });             
    }

    async function get_total_amount_staked() {
        const  web3 = window.web3;
        const Ethaccounts = await web3.eth.getAccounts();

        const StakingContract = new web3.eth.Contract(
            StakingABI.abi,
            StakingdContractAddress
        )

        await StakingContract.methods.total_amount_staked().call(function (error, result) {
            // console.log("Total Amonnt: " + result);
            setTotalAmountStaked(result / ONE_ETHER);
        })

    }

    async function get_amount_staked() {
        const  web3 = window.web3;
        const Ethaccounts = await web3.eth.getAccounts();

        const StakingContract = new web3.eth.Contract(
            StakingABI.abi,
            StakingdContractAddress
        )

        await StakingContract.methods.DepositerInfo(Ethaccounts[0]).call(function (error, result) {
            // console.log("Amoount: " + result[0]);

            if (result) {
                setAmountStaked(result[0] / ONE_ETHER);
            }
        })

    }

    async function Stake_ETH() {
        const web3 = window.web3;
        const Ethaccounts = await web3.eth.getAccounts();
        
        const StakingContract = new web3.eth.Contract(
          StakingABI.abi,
          StakingdContractAddress
        );
    
        await StakingContract.methods
          .stake_eth()
          .send({ from: Ethaccounts[0], value: (parseFloat(stakeAmount) *  ONE_ETHER)})
          .once("receipt", (receipt) => {
            //console.log(receipt);
            //console.log("transaction hash" + receipt.transactionHash);
          });
    }

    async function Unstake_ETH() {
        const web3 = window.web3;
        const Ethaccounts = await web3.eth.getAccounts();
        
        const StakingContract = new web3.eth.Contract(
          StakingABI.abi,
          StakingdContractAddress
        );

        //Maybe have to pull from current account in order to unstake correctly
        await StakingContract.methods
        .unstake_eth(Ethaccounts[0], (parseFloat(unstakeAmount) * ONE_ETHER).toString())
        .send({ from: Ethaccounts[0]})
        .once("receipt", (receipt) => {
          //console.log(receipt);
          //onsole.log("transaction hash" + receipt.transactionHash);
        });
    }

    async function Payout_Coins() {
        const web3 = window.web3;
        const Ethaccounts = await web3.eth.getAccounts();
        
        const StakingContract = new web3.eth.Contract(
          StakingABI.abi,
          StakingdContractAddress
        );

        await StakingContract.methods
        .payout_coins()
        .send({ from: Ethaccounts[0]})
        .once("receipt", (receipt) => {
          //console.log(receipt);
          //console.log("transaction hash" + receipt.transactionHash);
        });
    }

    function get_current_pay_out() {
        const payout = (amountStaked / totalAmountStaked) * 1000;
        setCurrentPayout(payout);
        console.log(payout);
    }

    useEffect(async () => {
        await getWalletAmount();
        await get_amount_staked();
        await get_total_amount_staked();
        await get_MemToken_balance();
        get_current_pay_out();

        console.log("Stake Amount: " + stakeAmount)
    })

    return (
        <>
        <div Style="padding:15px;">
            <h2>Wallet Amount: {walletAmount}</h2>
        

            <h3>Enter Amount: </h3>
            <input type="text"
                    value={stakeAmount}
                    onChange={e => setStakeAmount(e.target.value)}
            />
            <br />
            <br />
            <button onClick={() => Stake_ETH()}>
                Stake ETH 
            </button>
            <br />

            <h3>Enter Amount: </h3>
            <input type="text"
                    value={unstakeAmount}
                    onChange={e => setUnstakeAmount(e.target.value)}
            />
            <br />
            <br />
            <button onClick={() => Unstake_ETH()}>
                Unstake ETH
            </button>
            <br />
            <br />

            <h2>Total Staked In Contract: {totalAmountStaked} </h2>
            <h2>Current Amount Staked: {amountStaked} </h2>
            <h2>MemCoins: {memTokenBalance} </h2>
            <h2>Current Payout: {currentPayout} MC </h2>

            <br />

            <h2>Only the owner of the staking contract can call to payout coins</h2>
            <button onClick={() => Payout_Coins()}>
                Payout New Coins
            </button>

            <p>Coins are paid out everytime the payout_coins function is called, a total of 1,000 new coins are minted and your get the coresponding percentage of that
                to which you have staked. For Example if you have 15% of the ETH staked in the contract, at the time of the payout you would get 150 new coins. 
            </p>

            <p>
              From there you can chose to unstake your ETH at anytime or chose to leave it in the contract to gain for coins. However, you will be diluated out as more people
              chose to stake ETH in the contract meaning you will receive less and less coins unless you chose to stake more ETH. 
            </p>

            <br />
        </div>
        </>
    )
}