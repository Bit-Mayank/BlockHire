// scripts/deploy.js
const hre = require("hardhat");
const { parseEther } = require("ethers");
const { saveFrontendFiles } = require("./saveFrontendFiles");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);

    let balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", parseEther(balance.toString()));

    const Escrow = await ethers.getContractFactory("FreelanceEscrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment(); // ✅ Required in Hardhat v6+

    const deployedAddress = await escrow.getAddress();

    // Log the deployed address using the variable where you stored it
    console.log("FreelanceEscrow deployed at:", deployedAddress);
    // console.log(escrow);
    saveFrontendFiles(deployedAddress, "FreelanceEscrow");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
