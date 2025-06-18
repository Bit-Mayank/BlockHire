// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FreelanceEscrow is ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                  STORAGE                                   */
    /* -------------------------------------------------------------------------- */

    address public immutable owner;
    uint256 public jobCount;

    enum JobStatus {
        Open,
        InProgress,
        Submitted,
        Approved,
        Disputed,
        Closed,
        Cancelled // 6 – job withdrawn before a freelancer is selected
    }

    struct Bid {
        address bidder;
        uint256 amount; // wei
    }

    struct Job {
        uint256 jobId;
        address client;
        address freelancer; // selected freelancer (0x0 until chosen)
        string title;
        string specCID; // IPFS hash with full description
        string submissionCID; // IPFS hash with work result
        uint256 budget; // wei
        uint256 escrow; // wei locked in contract
        JobStatus status;
    }

    mapping(uint256 => Job) public jobs; // jobId → Job
    mapping(uint256 => Bid[]) private bids; // jobId → bids
    mapping(address => uint256[]) private jobsByUser; // user → jobIds

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event JobCreated(
        uint256 indexed id,
        address indexed client,
        uint256 budget
    );
    event BidPlaced(
        uint256 indexed id,
        address indexed freelancer,
        uint256 amount
    );
    event FreelancerSelected(
        uint256 indexed id,
        address indexed freelancer,
        uint256 escrow
    );
    event WorkSubmitted(uint256 indexed id, string submissionCID);
    event JobApproved(uint256 indexed id, uint256 payout);
    event DisputeRaised(uint256 indexed id);
    event DisputeResolved(uint256 indexed id, bool releasedToFreelancer);
    event JobCancelled(uint256 indexed id);

    /* -------------------------------------------------------------------------- */
    /*                                  MODIFIERS                                 */
    /* -------------------------------------------------------------------------- */

    modifier onlyClient(uint256 id) {
        require(msg.sender == jobs[id].client, "Not job owner");
        _;
    }
    modifier onlyFreelancer(uint256 id) {
        require(msg.sender == jobs[id].freelancer, "Not hired freelancer");
        _;
    }

    constructor() {
        owner = msg.sender;
        jobCount = 0;
    }

    /* -------------------------------------------------------------------------- */
    /*                              JOB LIFE-CYCLE                                */
    /* -------------------------------------------------------------------------- */

    /// @notice Client posts a new job (description stored off-chain on IPFS)
    function createJob(
        string calldata _title,
        uint256 _budget,
        string calldata _specCID
    ) external {
        require(_budget > 0, "Budget must be > 0");

        ++jobCount;
        Job storage J = jobs[jobCount];
        J.jobId = jobCount;
        J.client = msg.sender;
        J.title = _title;
        J.specCID = _specCID;
        J.budget = _budget;
        J.status = JobStatus.Open;

        jobsByUser[msg.sender].push(jobCount);

        emit JobCreated(jobCount, msg.sender, _budget);
    }

    /// @notice Freelancers place bids (optionally with refundable deposit)
    function placeBid(uint256 id) external payable nonReentrant {
        Job storage J = jobs[id];
        require(J.status == JobStatus.Open, "Job not open");
        bids[id].push(Bid(msg.sender, msg.value)); // 0-value bid is allowed

        emit BidPlaced(id, msg.sender, msg.value);
    }

    /// @notice Client selects a freelancer and funds escrow with exactly the job budget (ETH)
    function selectFreelancer(
        uint256 id,
        address _freelancer
    ) external payable onlyClient(id) nonReentrant {
        Job storage J = jobs[id];
        require(J.status == JobStatus.Open, "Job not open");
        require(msg.value == J.budget, "Send full budget");
        require(_freelancer != address(0), "Bad freelancer");

        J.freelancer = _freelancer;
        J.escrow = msg.value;
        J.status = JobStatus.InProgress;

        emit FreelancerSelected(id, _freelancer, msg.value);
    }

    /// @notice Freelancer submits completed work (IPFS CID)
    function submitWork(
        uint256 id,
        string calldata _submissionCID
    ) external onlyFreelancer(id) {
        Job storage J = jobs[id];
        require(J.status == JobStatus.InProgress, "Wrong status");

        J.submissionCID = _submissionCID;
        J.status = JobStatus.Submitted;

        emit WorkSubmitted(id, _submissionCID);
    }

    /// @notice Client approves work → escrow released to freelancer
    function approveWork(uint256 id) external onlyClient(id) nonReentrant {
        Job storage J = jobs[id];
        require(J.status == JobStatus.Submitted, "Work not submitted");

        uint256 payout = J.escrow;
        J.escrow = 0;
        J.status = JobStatus.Approved; // will mark Closed after transfer

        (bool ok, ) = payable(J.freelancer).call{value: payout}("");
        require(ok, "Transfer failed");

        J.status = JobStatus.Closed;
        emit JobApproved(id, payout);
    }

    /// @notice Either party can raise a dispute after submission
    function raiseDispute(uint256 id) external {
        Job storage J = jobs[id];
        require(
            msg.sender == J.client || msg.sender == J.freelancer,
            "Only involved parties"
        );
        require(
            J.status == JobStatus.Submitted || J.status == JobStatus.InProgress,
            "Cannot dispute"
        );
        J.status = JobStatus.Disputed;
        emit DisputeRaised(id);
    }

    function cancelJob(uint256 id) external onlyClient(id) nonReentrant {
        Job storage J = jobs[id];
        require(J.status == JobStatus.Open, "Job already in progress");

        // ── refund any deposits bidders may have sent ───────────────────────────
        Bid[] storage bidList = bids[id];
        for (uint i = 0; i < bidList.length; i++) {
            if (bidList[i].amount > 0) {
                (bool ok, ) = payable(bidList[i].bidder).call{
                    value: bidList[i].amount
                }("");
                require(ok, "Bid refund failed");
            }
        }

        // ── mark as cancelled & tidy up ──────────────────────────────────────────
        J.status = JobStatus.Cancelled;
        J.freelancer = address(0);
        J.escrow = 0; // nothing was escrowed yet
        J.submissionCID = "";

        emit JobCancelled(id);
    }

    /* -------------------------------------------------------------------------- */
    /*                         SIMPLE MANUAL DISPUTE RESOLUTION                   */
    /*         (In production wire this to a DAO / Kleros rather than owner)      */
    /* -------------------------------------------------------------------------- */

    function ownerResolveDispute(
        uint256 id,
        bool releaseToFreelancer
    ) external nonReentrant {
        require(msg.sender == owner, "Only contract owner (demo)");
        Job storage J = jobs[id];
        require(J.status == JobStatus.Disputed, "No dispute");

        uint256 amount = J.escrow;
        J.escrow = 0;

        if (releaseToFreelancer) {
            (bool ok, ) = payable(J.freelancer).call{value: amount}("");
            require(ok, "Transfer failed");
        } else {
            (bool ok, ) = payable(J.client).call{value: amount}("");
            require(ok, "Refund failed");
        }

        J.status = JobStatus.Closed;
        emit DisputeResolved(id, releaseToFreelancer);
    }

    /* -------------------------------------------------------------------------- */
    /*                                READ HELPERS                                */
    /* -------------------------------------------------------------------------- */

    function listBids(uint256 id) external view returns (Bid[] memory) {
        return bids[id];
    }

    function jobsOf(address user) external view returns (uint256[] memory) {
        return jobsByUser[user];
    }
}
