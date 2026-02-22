import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);
  const FlipFlux = await ethers.getContractFactory("FlipFlux");
  const contract = await FlipFlux.deploy();
  await contract.waitForDeployment();
  console.log("FlipFlux deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
