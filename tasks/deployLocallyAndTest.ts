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
  // (_user, _tokenId, _v, _r, _s, _transferToAddress, _callMethod)
  // Create message
  const t1 = "0x42186894CA4457bA5123F3D0e09C58E3675109ec";
  const t2 = 115;
  const t3 = 21;
  const t4 = ethers.utils.formatBytes32String("textABC");
  const t5 = ethers.utils.formatBytes32String("textDEF");
  const t6 = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  const t7 = ethers.utils.formatBytes32String("mint");

  // Encode message
  const abi = ethers.utils.defaultAbiCoder;
  const encodeDataMessage = abi.encode(
    ["address", "uint256", "uint8", "bytes32", "bytes32", "address", "bytes32"], // encode as address array
    [t1, t2, t3, t4, t5, t6, t7]
  );
  // Send to contract to decode and read

  const response = await contract.decodeMessage(encodeDataMessage);
  console.log("response --", response);
};

task("deployLocallyAndTest", "Deploy the contract", main)
  .addFlag("json", "Output in JSON")
  .addParam("maxSupplyInit", "The max supply of the NFT")
  .addParam("signerInit", "Address of the signer who validates the NFTs");

// npx hardhat deployLocallyAndTest --network zeta_testnet --max-supply-init 10000000 --signer-init 0x42186894CA4457bA5123F3D0e09C58E3675109ec
