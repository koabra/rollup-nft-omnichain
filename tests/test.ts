import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { parseUnits } from "@ethersproject/units";
import { getAddress } from "@zetachain/protocol-contracts";
import claimableAbi from "../artifacts/contracts/OmnichainClaimableToken.sol/OmnichainClaimableToken.json";
import { utils, ethers } from "ethers";
import ERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";

const main = async (args: any, hre: HardhatRuntimeEnvironment) => {
  const [signer] = await hre.ethers.getSigners();

    const claimableContractAddress = getAddress("OmnichainClaimableToken", hre.network.name as any);
    const claimableAddress = new ethers.Contract(
      claimableContractAddress,
      claimableAbi.abi,
      signer
    );


    const value = parseUnits(args.amount, 18);
    const to = getAddress("tss", hre.network.name as any);
    tx = await signer.sendTransaction({ data, to, value });
  }

  if (args.json) {
    console.log(JSON.stringify(tx, null, 2));
  } else {
    console.log(`🔑 Using account: ${signer.address}\n`);

    console.log(`🚀 Successfully broadcasted a token transfer transaction on ${hre.network.name} network.
📝 Transaction hash: ${tx.hash}
  `);
  }
};

task("interact", "Interact with the contract", main)
  .addParam("contract", "The address of the withdraw contract on ZetaChain")
  .addParam("amount", "Amount of tokens to send")
  .addOptionalParam("token", "The address of the token to send")
  .addFlag("json", "Output in JSON")
  .addParam("recipient");
