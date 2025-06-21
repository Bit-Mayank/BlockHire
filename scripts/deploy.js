// scripts/deploy.js
const hre = require("hardhat");
const { parseEther } = require("ethers");
const { saveFrontendFiles } = require("./saveFrontendFiles");

async function main() {
    const [deployer, client] = await ethers.getSigners();

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

    const tx = await escrow.connect(client).registerUser(); // uses default profileCID = ""
    await tx.wait();

    const Job1 = await escrow.connect(client).createJob("Logo Design", parseEther('5'), "bafkreiholqy4g264iteddj76xabeeqjbuyroefdmfifla6e36ogds76ibq")
    await Job1.wait();
    const Job2 = await escrow.connect(client).createJob("Website Design", parseEther('3'), "bafkreiholqy4g264iteddj76xabeeqjbuyroefdmfifla6e36ogds76ibq")
    await Job2.wait();
    const Job3 = await escrow.connect(client).createJob("Mobile App Design", parseEther('2'), "bafkreiholqy4g264iteddj76xabeeqjbuyroefdmfifla6e36ogds76ibq")
    await Job3.wait();
    const Job4 = await escrow.connect(client).createJob("Block Chain App Design", parseEther('2'), "bafkreihjugl5gzqgs5maryhnfu4qj6g7h2rhjjiludq24qd2hs4tyvjhtu")
    await Job4.wait();
    const Job5 = await escrow.connect(client).createJob("Flutter App Development", parseEther('2'), "bafkreihjugl5gzqgs5maryhnfu4qj6g7h2rhjjiludq24qd2hs4tyvjhtu")
    await Job5.wait();
    const Job6 = await escrow.connect(client).createJob("Kotlin App", parseEther('2'), "bafkreihjugl5gzqgs5maryhnfu4qj6g7h2rhjjiludq24qd2hs4tyvjhtu")
    await Job6.wait();

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
