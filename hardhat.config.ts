import "./tasks/interact";
import "./tasks/deployLocallyAndTest";
import "./tasks/burnAndRelease";
import "@nomicfoundation/hardhat-toolbox";
import "@zetachain/toolkit/tasks";

import { getHardhatConfigNetworks } from "@zetachain/networks";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 7001,
      forking: {
        url: "https://rpc.ankr.com/zetachain_evm_athens_testnet",
      },
    },
    ...getHardhatConfigNetworks(),
  },
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.8.20",
      },
    ],
  },
};

export default config;
