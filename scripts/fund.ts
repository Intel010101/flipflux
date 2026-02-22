import { ethers } from "hardhat";

async function main() {
  const target = process.env.FUND_TARGET;
  const amount = process.env.FUND_AMOUNT || "0.5";
  if (!target) throw new Error("FUND_TARGET env var required");

  const [signer] = await ethers.getSigners();
  console.log(`Funding ${target} with ${amount} ETH from ${signer.address}`);
  const tx = await signer.sendTransaction({
    to: target,
    value: ethers.parseEther(amount),
  });
  await tx.wait();
  console.log("Tx hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
