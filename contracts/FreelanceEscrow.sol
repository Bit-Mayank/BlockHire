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

    struct UserProfile {
        bool isRegistered;
        string profileCID;
        uint256[] jobsPosted;
        uint256[] jobsCompleted;
        uint256 totalSpent;
        uint256 totalEarned;
        uint256[] jobsBidOn;
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
    mapping(address => UserProfile) public userProfiles;
    mapping(uint256 => mapping(address => uint256)) public bidAmounts; //JodId -> user -> kitna dia
    mapping(uint256 => mapping(address => bool)) public hasBid;

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
    event UserRegistered(address indexed user);
    event BidRefunded(
        uint256 indexed jobId,
        address indexed bidder,
        uint256 amount
    );

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

        userProfiles[msg.sender].jobsPosted.push(jobCount);
        jobsByUser[msg.sender].push(jobCount);

        emit JobCreated(jobCount, msg.sender, _budget);
    }

    /// @notice Registration of new User
    function registerUser() external {
        require(!userProfiles[msg.sender].isRegistered, "Already registered");

        userProfiles[msg.sender] = UserProfile({
            isRegistered: true,
            profileCID: "",
            jobsPosted: new uint256[](0),
            jobsCompleted: new uint256[](0),
            jobsBidOn: new uint256[](0),
            totalSpent: 0,
            totalEarned: 0
        });

        emit UserRegistered(msg.sender);
    }

    /// @notice Update user profile CID
    function updateProfileCID(string calldata _profileCID) external {
        require(userProfiles[msg.sender].isRegistered, "User not registered");
        userProfiles[msg.sender].profileCID = _profileCID;
    }

    /// @notice Freelancers place bids (optionally with refundable deposit)
    function placeBid(uint256 jobId) external payable nonReentrant {
        Job storage J = jobs[jobId];
        require(J.status == JobStatus.Open, "Job not open");
        require(!hasBid[jobId][msg.sender], "Already placed a bid");
        require(msg.value > 0, "Bid must be greater than 0");

        // Record the bid
        bids[jobId].push(Bid(msg.sender, msg.value));
        hasBid[jobId][msg.sender] = true;
        bidAmounts[jobId][msg.sender] = msg.value;
        userProfiles[msg.sender].jobsBidOn.push(jobId);

        emit BidPlaced(jobId, msg.sender, msg.value);
    }

    function refundBid(uint256 jobId) external nonReentrant {
        require(hasBid[jobId][msg.sender], "You did not bid on this job");
        require(jobs[jobId].freelancer != msg.sender, "Winner cannot withdraw");

        uint256 amount = bidAmounts[jobId][msg.sender];
        require(amount > 0, "No funds to withdraw");

        // Prevent reentrancy before transfer
        for (uint i = 0; i < bids[jobId].length; i++) {
            if (bids[jobId][i].bidder == msg.sender) {
                bids[jobId][i].amount = 0;
                break;
            }
        }
        bidAmounts[jobId][msg.sender] = 0;

        payable(msg.sender).transfer(amount);
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
        uint256 bidRefund = bidAmounts[id][J.freelancer];
        uint256 totalPayout = payout + bidRefund;

        J.escrow = 0;
        bidAmounts[id][J.freelancer] = 0; // Prevent double spending
        J.status = JobStatus.Approved;

        (bool ok, ) = payable(J.freelancer).call{value: totalPayout}("");
        require(ok, "Transfer failed");

        userProfiles[J.client].totalSpent += J.budget;
        userProfiles[J.freelancer].totalEarned += J.budget;
        userProfiles[J.freelancer].jobsCompleted.push(id);

        J.status = JobStatus.Closed;

        emit JobApproved(id, payout);
        if (bidRefund > 0) {
            emit BidRefunded(id, J.freelancer, bidRefund);
        }
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
            uint256 bidRefund = bidAmounts[id][J.freelancer];
            uint256 totalPayout = amount + bidRefund;
            bidAmounts[id][J.freelancer] = 0; // Prevent double spending

            (bool ok, ) = payable(J.freelancer).call{value: totalPayout}("");
            require(ok, "Transfer failed");

            userProfiles[J.freelancer].totalEarned += J.budget;
            userProfiles[J.freelancer].jobsCompleted.push(id);

            if (bidRefund > 0) {
                emit BidRefunded(id, J.freelancer, bidRefund);
            }
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

    function isUserRegistered(address user) external view returns (bool) {
        return userProfiles[user].isRegistered;
    }

    function listBids(uint256 id) external view returns (Bid[] memory) {
        return bids[id];
    }

    function jobsOf(address user) external view returns (uint256[] memory) {
        return jobsByUser[user];
    }

    function listOpenJobs() external view returns (Job[] memory) {
        // First pass: count the number of open jobs
        uint256 openCount = 0;
        for (uint256 jobId = 1; jobId <= jobCount; jobId++) {
            if (jobs[jobId].status == JobStatus.Open) {
                openCount++;
            }
        }

        // Second pass: populate the array
        Job[] memory openJobs = new Job[](openCount);
        uint256 index = 0;
        for (uint256 jobId = 1; jobId <= jobCount; jobId++) {
            if (jobs[jobId].status == JobStatus.Open) {
                openJobs[index] = jobs[jobId];
                index++;
            }
        }

        return openJobs;
    }

    function listDisputedJobs() external view returns (Job[] memory) {
        // First pass: count the number of open jobs
        uint256 disputedCount = 0;
        for (uint256 jobId = 1; jobId <= jobCount; jobId++) {
            if (jobs[jobId].status == JobStatus.Disputed) {
                disputedCount++;
            }
        }

        // Second pass: populate the array
        Job[] memory disputedJobs = new Job[](disputedCount);
        uint256 index = 0;
        for (uint256 jobId = 1; jobId <= jobCount; jobId++) {
            if (jobs[jobId].status == JobStatus.Disputed) {
                disputedJobs[index] = jobs[jobId];
                index++;
            }
        }

        return disputedJobs;
    }

    function getJobsByIds(
        uint256[] memory ids
    ) public view returns (Job[] memory) {
        Job[] memory result = new Job[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = jobs[ids[i]];
        }
        return result;
    }

    function getFullUserProfile(
        address user
    )
        external
        view
        returns (
            string memory profileCID,
            uint256 totalSpent,
            uint256 totalEarned,
            uint256[] memory jobsPosted,
            uint256[] memory jobsCompleted,
            uint256[] memory jobsBidOn
        )
    {
        UserProfile storage p = userProfiles[user];
        return (
            p.profileCID,
            p.totalSpent,
            p.totalEarned,
            p.jobsPosted,
            p.jobsCompleted,
            p.jobsBidOn
        );
    }
}
