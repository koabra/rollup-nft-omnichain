import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import NFTOmniContract from "../artifacts/contracts/OmnichainClaimableToken.sol/OmnichainClaimableToken.json";

const main = async (args: any, hre: HardhatRuntimeEnvironment) => {
  // We cna only burn in the zeta network since it is where it is minted.
  if (hre.network.name !== "zeta_testnet") {
    throw new Error(
      '🚨 Please use the "zeta_testnet" network to deploy to ZetaChain.'
    );
  }

  const [signer] = await hre.ethers.getSigners();

  console.log(
    "The token you are burning with ID: ",
    args.tokenid,
    " to address: ",
    args.recipient
  );

  if (!args.tokenid || !args.recipient) {
    throw new Error(
      "🚨 Please provide tokenID and the recipient to return the emitted target chain coins to"
    );
  }

  // let tx;
  let burnAndRelease;

  if (args.nftcontractaddress) {
    const NftContract = new ethers.Contract(
      args.nftcontractaddress,
      NFTOmniContract.abi,
      signer
    );
    burnAndRelease = await NftContract.burnNFT(args.tokenid, args.recipient);
    await burnAndRelease.wait();
  }

  // JSON response print
  if (args.json) {
    console.log(JSON.stringify(burnAndRelease, null, 2));
  } else {
    console.log(`🔑 Using account: ${signer.address}\n`);

    console.log(`🚀 Successfully burned a token with ID ${args.tokenid} on ${hre.network.name} network.
📝 Transaction hash: ${burnAndRelease.hash}
  `);
  }
};

task(
  "burnAndRelease",
  "Burn the NFT and release the coins on target chain",
  main
)
  .addParam(
    "nftcontractaddress",
    "The address of the NFT Omni-contract on ZetaChain"
  )
  .addParam("tokenid", "tokenID of the NFT that you want to burn and release")
  .addFlag("json", "Output in JSON")
  .addParam(
    "recipient",
    "The address where the released tokens/coins should be sent to"
  );
