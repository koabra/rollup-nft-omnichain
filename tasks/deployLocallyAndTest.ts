import { getAddress } from "@zetachain/protocol-contracts";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";

const main = async (args: any, hre: HardhatRuntimeEnvironment) => {
  // if (hre.network.name !== "zeta_testnet") {
  //   throw new Error(
  //     '🚨 Please use the "zeta_testnet" network to deploy to ZetaChain.'
  //   );
  // }

  const [signer] = await hre.ethers.getSigners();
  if (signer === undefined) {
    throw new Error(
      `Wallet not found. Please, run "npx hardhat account --save" or set PRIVATE_KEY env variable (for example, in a .env file)`
    );
  }

  const systemContract = getAddress("systemContract", "zeta_testnet");

  const onmiChainContract = await hre.ethers.getContractFactory(
    "OmnichainClaimableToken"
  );

  const contract = await onmiChainContract.deploy(
    systemContract,
    args.maxSupplyInit,
    args.signerInit
  );

  await contract.deployed();

  if (args.json) {
    console.log(JSON.stringify(contract));
  } else {
    console.log(`🔑 Using account: ${signer.address}

    🚀 Successfully deployed contract on Local forked ZetaChain.
    📜 Contract address: ${contract.address}
    🌍 Explorer: https://athens3.explorer.zetachain.com/address/${contract.address}
    `);
  }

  console.log("Testing  ... ");
  // Create message
  const t1 = 113;
  const t2 = "0xad523115cd35a8d4e60b3c0953e0e0ac10418309";
  const t3 = 21;
  const t4 = ethers.utils.formatBytes32String("textABC");
  const t5 = ethers.utils.formatBytes32String("textDEF");

  // Encode message
  const abi = ethers.utils.defaultAbiCoder;
  const encodeDataMessage = abi.encode(
    ["uint256", "address", "uint8", "bytes32", "bytes32"], // encode as address array
    [t1, t2, t3, t4, t5]
  );
  // Send to contract to decode and read

  const response = await contract.decodeMessage(encodeDataMessage);
  console.log("response", response);
};

task("deployLocallyAndTest", "Deploy the contract", main)
  .addFlag("json", "Output in JSON")
  .addParam("maxSupplyInit", "The max supply of the NFT")
  .addParam("signerInit", "Address of the signer who validates the NFTs");
