import { getAddress } from "@zetachain/protocol-contracts";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

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

    🚀 Successfully deployed contract on ZetaChain.
    📜 Contract address: ${contract.address}
    🌍 Explorer: https://athens3.explorer.zetachain.com/address/${contract.address}
    `);
  }
};

task("deployLocallyAndTest", "Deploy the contract", main)
  .addFlag("json", "Output in JSON")
  .addParam("maxSupplyInit", "The max supply of the NFT")
  .addParam("signerInit", "Address of the signer who validates the NFTs");
