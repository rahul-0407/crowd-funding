import React, { useContext, createContext } from "react";
import {
  useActiveAccount,
  useConnect,
  useSendTransaction,
} from "thirdweb/react";
import { getContract, prepareContractCall, readContract } from "thirdweb";
import { client } from "../lib/client";
import { defineChain } from "thirdweb/chains";
import { toWei, toTokens } from "thirdweb/utils";
import { createWallet } from "thirdweb/wallets";

const StateContext = createContext();

const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: "0x354b650224F78084A8EC08040ACCD65A548654a0",
});

export const StateContextProvider = ({ children }) => {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const { connect } = useConnect();

  const connectWallet = async () => {
    await connect(async () => {
      const wallet = createWallet("io.metamask"); 
      await wallet.connect({ client });
      return wallet; 
    });
  };

  const { mutateAsync: sendTransaction } = useSendTransaction();

  const publishCampaign = async (form) => {
    if (!address) return alert("Connect wallet first");

    const tx = prepareContractCall({
      contract,
      method:
        "function createCampaign(address _owner, string _title, string _description, uint256 _target, uint256 _deadline, string _image)",
      params: [
        address,
        form.title,
        form.description,
        toWei(String(form.target)), 
        BigInt(new Date(form.deadline).getTime()),
        form.image,
      ],
    });

    return await sendTransaction(tx);
  };

 const getCampaigns = async () => {
    try {
      const campaigns = await readContract({
        contract,
        method:
          "function getCampaigns() view returns ((address owner, string title, string description, uint256 target, uint256 deadline, uint256 amountCollected, string image, address[] donators, uint256[] donations)[])",
        params: [],
      });

      console.log("Fetched campaigns:", campaigns);

      return campaigns.map((c, i) => ({
        owner: c.owner,
        title: c.title,
        description: c.description,
        target: toTokens(c.target, 18),
        deadline: Number(c.deadline),
        amountCollected: toTokens(c.amountCollected, 18),
        image: c.image,
        pId: i,
      }));
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      return [];
    }
  };


  const getUserCampaigns = async () => {
    const all = await getCampaigns();
    return all.filter((c) => c.owner.toLowerCase() === address?.toLowerCase());
  };

  const donate = async (pId, amount) => {
    const tx = prepareContractCall({
      contract,
      method: "function donateToCampaign(uint256 _id) payable",
      params: [BigInt(pId)],
      value: toWei(amount), // ✅ convert ETH → wei
    });

    return await sendTransaction(tx);
  };

  const getDonations = async (pId) => {
    const [donators, donations] = await readContract({
      contract,
      method: "getDonators",
      params: [BigInt(pId)],
    });

    return donators.map((addr, i) => ({
      donator: addr,
      donation: toTokens(donations[i], 18),
    }));
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect: connectWallet,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
