// File: test/FreelanceEscrow.test.js
// Hardhat + Mocha/Chai tests for the updated FreelanceEscrow contract
// run with: npx hardhat test

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = ethers;

describe("FreelanceEscrow", function () {
    let Escrow, escrow;
    let owner, client, freelancer, bidder1, bidder2;

    beforeEach(async () => {
        [owner, client, freelancer, bidder1, bidder2] = await ethers.getSigners();
        Escrow = await ethers.getContractFactory("FreelanceEscrow");
        escrow = await Escrow.deploy();
        await escrow.waitForDeployment(); // Recommended for newer Hardhat + Ethers
        console.log(`Contract Deployea at: ${escrow.address}`)

    });

    /* -------------------------------------------------------------------------- */
    /*                               JOB CREATION                                 */
    /* -------------------------------------------------------------------------- */

    it("Client can create a job", async () => {
        const budget = parseEther("1");
        await expect(
            escrow.connect(client).createJob("Logo Design", budget, "QmCID")
        ).to.emit(escrow, "JobCreated");

        const ids = await escrow.jobsOf(client.address);
        expect(ids.length).to.equal(1);
        const job = await escrow.jobs(ids[0]);
        expect(job.title).to.equal("Logo Design");
        expect(job.status).to.equal(0); // Open
    });

    /* -------------------------------------------------------------------------- */
    /*                               BIDDING                                      */
    /* -------------------------------------------------------------------------- */

    it("Freelancers can place bids with optional deposit", async () => {
        // create job
        await escrow.connect(client).createJob("Site", parseEther("1"), "CID");
        const id = (await escrow.jobsOf(client.address))[0];

        await expect(
            escrow.connect(bidder1).placeBid(id, { value: parseEther("0.1") })
        ).to.emit(escrow, "BidPlaced");

        const bids = await escrow.listBids(id);
        expect(bids.length).to.equal(1);
        expect(bids[0].bidder).to.equal(bidder1.address);
    });

    /* -------------------------------------------------------------------------- */
    /*                        SELECT + ESCROW FUNDING                              */
    /* -------------------------------------------------------------------------- */

    it("Client selects freelancer & locks budget", async () => {
        const budget = parseEther("2.5");
        await escrow.connect(client).createJob("API", budget, "CID");
        const id = (await escrow.jobsOf(client.address))[0];

        await expect(
            escrow.connect(client).selectFreelancer(id, freelancer.address, { value: budget })
        ).to.emit(escrow, "FreelancerSelected");

        const job = await escrow.jobs(id);
        expect(job.status).to.equal(1); // InProgress
        expect(job.escrow).to.equal(budget);
    });

    /* -------------------------------------------------------------------------- */
    /*                          WORK SUBMIT & APPROVE                              */
    /* -------------------------------------------------------------------------- */

    it("Workflow: submit → approve → payout", async () => {
        const budget = parseEther("1");
        await escrow.connect(client).createJob("Doc", budget, "CID");
        const id = (await escrow.jobsOf(client.address))[0];
        await escrow.connect(client).selectFreelancer(id, freelancer.address, { value: budget });

        await expect(
            escrow.connect(freelancer).submitWork(id, "QmWork")
        ).to.emit(escrow, "WorkSubmitted");

        const balBefore = await ethers.provider.getBalance(freelancer.address);
        await expect(escrow.connect(client).approveWork(id)).to.emit(escrow, "JobApproved");
        const balAfter = await ethers.provider.getBalance(freelancer.address);

        expect(balAfter - balBefore).to.equal(budget);
        expect((await escrow.jobs(id)).status).to.equal(5); // Closed
    });

    /* -------------------------------------------------------------------------- */
    /*                              CANCEL JOB                                     */
    /* -------------------------------------------------------------------------- */

    it("Client can cancel an open job and refund bidder deposits", async () => {
        const budget = parseEther("1");
        await escrow.connect(client).createJob("Cancel Test", budget, "CID");
        const id = (await escrow.jobsOf(client.address))[0];

        // bidder sends 0.2 ETH deposit
        const dep = parseEther("0.2");
        await escrow.connect(bidder1).placeBid(id, { value: dep });

        const balBefore = await ethers.provider.getBalance(bidder1.address);

        // cancel job
        await expect(escrow.connect(client).cancelJob(id)).to.emit(escrow, "JobCancelled");

        const balAfter = await ethers.provider.getBalance(bidder1.address);
        expect(balAfter).to.be.above(balBefore); // refunded (ignore gas math)

        const job = await escrow.jobs(id);
        expect(job.status).to.equal(6); // Cancelled
    });

    /* -------------------------------------------------------------------------- */
    /*                           DISPUTE → OWNER RESOLVE                           */
    /* -------------------------------------------------------------------------- */

    it("Owner can resolve disputes", async () => {
        const budget = parseEther("0.5");
        await escrow.connect(client).createJob("Dispute", budget, "CID");
        const id = (await escrow.jobsOf(client.address))[0];
        await escrow.connect(client).selectFreelancer(id, freelancer.address, { value: budget });
        await escrow.connect(freelancer).submitWork(id, "QmWork");

        // raise dispute
        await escrow.connect(client).raiseDispute(id);
        expect((await escrow.jobs(id)).status).to.equal(4); // Disputed

        // resolve in favor of freelancer
        const balBefore = await ethers.provider.getBalance(freelancer.address);
        await expect(escrow.connect(owner).ownerResolveDispute(id, true)).to.emit(escrow, "DisputeResolved");
        const balAfter = await ethers.provider.getBalance(freelancer.address);
        expect(balAfter - balBefore).to.equal(budget);
        expect((await escrow.jobs(id)).status).to.equal(5); // Closed
    });
});
