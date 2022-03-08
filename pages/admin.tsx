import { useCallback, useEffect, useState } from "react";

import Web3 from "web3";
import { AbiItem } from "web3-utils";

import TipBot from "../solidity/build/contracts/TipBot.json";

declare global {
  interface Window {
    ethereum: {
      isMetaMask: boolean;
      request: (params: { method: string; params?: any }) => Promise<string>;
      isConnected: boolean;
      selectedAddress: string;
    };
  }
}

const httpProvider = new Web3.providers.HttpProvider(
  "https://rpc.syscoin.org/"
);
const web3 = new Web3(httpProvider);

const contractAddress = "0x0B5ba273F261DA89a6D68f29f84a2D9DD4f6C38c";

const contract = new web3.eth.Contract(
  TipBot.abi as unknown as AbiItem,
  contractAddress
);

const Admin: React.FC = () => {
  const [isMetamaskEnabled, setIsMetamaskEnabled] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [feeRate, setFeeRate] = useState("0");
  const [airdropFeeRate, setAirdropFeeRate] = useState("0");
  const [adminCount, setAdminCount] = useState(0);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
      setIsMetamaskEnabled(true);
    }
  }, []);

  const fetchFeeRate = () => {
    contract.methods
      .feeRate()
      .call()
      .then((feeRateInWei: number) => {
        setFeeRate(web3.utils.fromWei(`${feeRateInWei}`));
      });

    contract.methods
      .airdropRate()
      .call()
      .then((feeRateInWei: number) => {
        setAirdropFeeRate(web3.utils.fromWei(`${feeRateInWei}`));
      });
  };

  const initialize = useCallback(async (account: string) => {
    const adminRole = await contract.methods.DEFAULT_ADMIN_ROLE().call();
    contract.methods.hasRole(adminRole, account).call().then(setIsAdmin);
    fetchFeeRate();
    contract.methods.getRoleMemberCount(adminRole).call().then(setAdminCount);
  }, []);

  const updateFeeRate = async () => {
    const feeRateInWei = web3.utils.toWei(feeRate);
    debugger;
    const data = contract.methods.setFeeRate(feeRateInWei).encodeABI();

    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: window.ethereum.selectedAddress, // must match user's active address.
      value: "0x00", // Only required to send ether to the recipient from the initiating external account.
      data,
    };

    // txHash is a hex string
    // As with any RPC call, it may throw an error
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
  };

  useEffect(() => {
    if (!account) {
      return;
    }
    initialize(account).then();
  }, [account, initialize]);

  if (!isMetamaskEnabled) {
    return <>Metamask not installed</>;
  }

  const handleConnext = () => {
    window.ethereum
      .request({
        method: "eth_requestAccounts",
      })
      .then((accounts) => setAccount(accounts[0]));
  };

  return (
    <div>
      {!account && <button onClick={handleConnext}>Connect</button>}
      <p>{account}</p>
      <p>{isAdmin && "I AM ADMIN"}</p>
      <div>
        <label htmlFor="feeRate">Fee Rate:</label>
        <input
          name="feeRate"
          onChange={(e) => setFeeRate(e.target.value)}
          value={feeRate}
          type="text"
        ></input>
        <button onClick={updateFeeRate}>Update</button>
      </div>
      <p>Airdrop Fee Rate: {airdropFeeRate}</p>
      <p>Admins: {adminCount}</p>
    </div>
  );
};

export default Admin;
