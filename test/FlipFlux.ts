import { expect } from "chai";
import { ethers } from "hardhat";

describe("FlipFlux", () => {
  async function deploy() {
    const [owner, player] = await ethers.getSigners();
    const FlipFlux = await ethers.getContractFactory("FlipFlux");
    const contract = await FlipFlux.deploy();
    await contract.waitForDeployment();
    await owner.sendTransaction({ to: await contract.getAddress(), value: ethers.parseEther("1") });
    return { contract, owner, player };
  }

  it("rejects when wager zero", async () => {
    const { contract, player } = await deploy();
    await expect(contract.connect(player).flip(0)).to.be.revertedWith("Wager required");
  });
});
