// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const { ethers } = hre;
    const { parseEther, formatEther } = ethers;

    const [deployer, client] = await ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);

    let balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", formatEther(balance), "ETH");

    const Escrow = await ethers.getContractFactory("FreelanceEscrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    const deployedAddress = await escrow.getAddress();
    console.log("FreelanceEscrow deployed at:", deployedAddress);

    // Save ABI + address for frontend
    const { saveFrontendFiles } = require("./saveFrontendFiles");
    saveFrontendFiles(deployedAddress, "FreelanceEscrow");

    // ---- Transactions ----
    const tx = await escrow.connect(client).registerUser(); // default profileCID = ""
    await tx.wait();

    const job1 = await escrow.connect(client).createJob(
        "Logo Design",
        parseEther("5"),
        "bafkreiholqy4g264iteddj76xabeeqjbuyroefdmfifla6e36ogds76ibq"
    );
    await job1.wait();

    const job2 = await escrow.connect(client).createJob(
        "Website Design",
        parseEther("3"),
        "bafkreiholqy4g264iteddj76xabeeqjbuyroefdmfifla6e36ogds76ibq"
    );
    await job2.wait();

    const job3 = await escrow.connect(client).createJob(
        "Mobile App Design",
        parseEther("2"),
        "bafkreiholqy4g264iteddj76xabeeqjbuyroefdmfifla6e36ogds76ibq"
    );
    await job3.wait();

    const job4 = await escrow.connect(client).createJob(
        "Block Chain App Design",
        parseEther("2"),
        "bafkreihjugl5gzqgs5maryhnfu4qj6g7h2rhjjiludq24qd2hs4tyvjhtu"
    );
    await job4.wait();

    const job5 = await escrow.connect(client).createJob(
        "Flutter App Development",
        parseEther("2"),
        "bafkreihjugl5gzqgs5maryhnfu4qj6g7h2rhjjiludq24qd2hs4tyvjhtu"
    );
    await job5.wait();

    const job6 = await escrow.connect(client).createJob(
        "Kotlin App",
        parseEther("2"),
        "bafkreihjugl5gzqgs5maryhnfu4qj6g7h2rhjjiludq24qd2hs4tyvjhtu"
    );
    await job6.wait();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
