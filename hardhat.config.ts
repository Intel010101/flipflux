import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox";

dotenvConfig();

const deployerKey = process.env.DEPLOYER_PRIVATE_KEY ?? "";
const accounts = deployerKey ? [deployerKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts,
    },
    abstractTestnet: {
      url: process.env.ABSTRACT_RPC_URL || "",
      chainId: Number(process.env.ABSTRACT_CHAIN_ID || 11124),
      accounts,
    },
  },
};

export default config;
