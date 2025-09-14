import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { formatEther, parseEther } from 'ethers';
import { ChainContext } from '../context/ChainContextProvider';
import BidList from '../components/BidList';
import { getStatus } from '../utils/jobUtils';
import { useToast } from '../utils/useToast';
import LoadingSpinner from '../components/LoadingSpinner';

function JobPage() {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const { contract, signer, account, admin } = useContext(ChainContext);
    const [bidAmount, setBidAmount] = useState('');
    const [bids, setBids] = useState([]);
    const [submittedWork, setSubmittedWork] = useState("");
    const { showSuccess, showError } = useToast();

    // Separate loading states for different actions
    const [placeBidLoading, setPlaceBidLoading] = useState(false);
    const [selectFreelancerLoading, setSelectFreelancerLoading] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [submitWorkLoading, setSubmitWorkLoading] = useState(false);
    const [approveWorkLoading, setApproveWorkLoading] = useState(false);
    const [disputeLoading, setDisputeLoading] = useState(false);
    const [resolveDisputeLoading, setResolveDisputeLoading] = useState(false);
    const [selectedBidderAddress, setSelectedBidderAddress] = useState(null); // Track which bidder is being selected

    // At the top of your React component
    const [selectedWinner, setSelectedWinner] = useState(null); // null means nothing is selected initially

    const handleSelectionChange = (event) => {
        setSelectedWinner(event.target.value);
    };

    const handleSelectFreelancer = async (bidderAddress) => {
        try {
            setSelectFreelancerLoading(true);
            setSelectedBidderAddress(bidderAddress);
            const tx = await contract.selectFreelancer(jobId, bidderAddress, {
                value: job.budget.toString()
            });
            await tx.wait();
            showSuccess("Freelancer selected successfully!");

            // Refetch job and bids to reflect status change (Open -> In Progress)
            await refetchJobData();

            setSelectFreelancerLoading(false);
            setSelectedBidderAddress(null);
        } catch (err) {
            setSelectFreelancerLoading(false);
            setSelectedBidderAddress(null);
            showError("Failed to select freelancer. Please try again.");
            console.error("Failed to select freelancer:", err);
        }
    };

    const handlePlaceBid = async () => {
        if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
            showError('Please enter a valid bid amount.');
            return;
        }

        setPlaceBidLoading(true);

        try {
            const tx = await contract.connect(signer).placeBid(Number(jobId), {
                value: parseEther(bidAmount),
            });
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                showSuccess('Bid placed successfully!');
                setBidAmount('');

                // Refetch bids to show the new bid
                await fetchBids();
            } else {
                showError('Transaction failed.');
            }
            setPlaceBidLoading(false);
        } catch (err) {
            console.error('Failed to place bid:', err);
            setPlaceBidLoading(false);
            showError('Transaction failed: ' + (err.reason || err.message || 'Unknown error'));
        }
    };

    const handleWithdraw = async () => {
        try {
            setWithdrawLoading(true);
            const response = await contract.connect(signer).refundBid(jobId);
            await response.wait();

            showSuccess("Withdrawal successful!");

            // Refetch bids to remove the withdrawn bid
            await fetchBids();

            setWithdrawLoading(false);
        } catch (e) {
            setWithdrawLoading(false);
            showError("Something went wrong with withdrawal. Please try again.");
            console.error("BidList: handleWithdraw: ", e)
        }
    };

    const handleSubmitWork = async () => {
        try {
            setSubmitWorkLoading(true);
            const response = await contract.connect(signer).submitWork(jobId, submittedWork)
            await response.wait();

            showSuccess("Work submitted successfully!");

            // Refetch job to reflect status change (In Progress -> Submitted)
            await refetchJobData();

            setSubmitWorkLoading(false);
        } catch (error) {
            setSubmitWorkLoading(false);
            showError("Something went wrong. Please try again.");
            console.error("Job Page: handleSubmitWork: ", error);
        }
    }

    const handleApprove = async () => {
        try {
            setApproveWorkLoading(true);
            const response = await contract.connect(signer).approveWork(jobId);
            await response.wait();

            showSuccess("Work approved successfully!");

            // Refetch job to reflect status change (Submitted -> Completed)
            await refetchJobData();

            setApproveWorkLoading(false);
        } catch (error) {
            setApproveWorkLoading(false);
            showError("Something went wrong. Please try again.");
            console.error("JobPage: handleApprove: ", error);
        }
    }

    const handleDispute = async () => {
        try {
            setDisputeLoading(true);
            const response = await contract.connect(signer).raiseDispute(jobId);
            await response.wait();

            showSuccess("Dispute raised successfully!");

            // Refetch job to reflect status change (-> Disputed)
            await refetchJobData();

            setDisputeLoading(false);
        } catch (error) {
            setDisputeLoading(false);
            showError("Something went wrong. Please try again.");
            console.error("JobPage: handleDispute: ", error);
        }
    }

    const handleResolveDispute = async () => {
        try {
            if (!selectedWinner) {
                showError("Please select a person to pay");
                return;
            }

            setResolveDisputeLoading(true);
            const releaseToFreelancer = selectedWinner === "freelancer";
            const response = await contract.connect(signer).ownerResolveDispute(jobId, releaseToFreelancer);
            await response.wait();

            showSuccess("Dispute resolved successfully!");

            // Refetch job to reflect status change (Disputed -> Completed/Cancelled)
            await refetchJobData();

            setResolveDisputeLoading(false);
        } catch (err) {
            setResolveDisputeLoading(false);
            showError("Either you are not the owner or something went wrong");
            console.error("JobPage: handleResolveDispute: ", err);
        }
    }

    // Reusable function to fetch job details
    const fetchJob = async () => {
        try {
            const fetchedJob = await contract.jobs(jobId);
            const id = fetchedJob.jobId;
            const cid = fetchedJob.specCID;
            let metadata = {};
            let imageUrl = '';

            try {
                const metadataRes = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
                metadata = await metadataRes.json();

                if (metadata.imageCID) {
                    imageUrl = `https://gateway.lighthouse.storage/ipfs/${metadata.imageCID}`;
                }
            } catch (e) {
                console.warn(`Could not load metadata from IPFS CID ${cid}`, e);
            }

            const jobDetails = {
                id: id.toString(),
                title: fetchedJob.title,
                budget: fetchedJob.budget.toString(),
                status: getStatus(fetchedJob.status),
                freelancer: fetchedJob.freelancer,
                specCID: cid,
                client: fetchedJob.client,
                submissionCID: fetchedJob.submissionCID,
                metadata,
                imageUrl,
            };

            setJob(jobDetails);
        } catch (err) {
            console.error('Failed to fetch job details', err);
        }
    };

    // Reusable function to fetch bids
    const fetchBids = async () => {
        try {
            const jobBids = await contract.listBids(jobId);
            setBids(jobBids);
        } catch (err) {
            console.error('Failed to fetch bids', err);
        }
    };

    // Function to refetch both job and bids after status changes
    const refetchJobData = async () => {
        if (contract && jobId) {
            await Promise.all([fetchJob(), fetchBids()]);
        }
    };

    useEffect(() => {
        if (contract && jobId) {
            fetchJob();
            fetchBids();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract, jobId]);

    return (
        <div className="min-h-screen bg-gray-950 pb-16">
            <div className="flex justify-center min-h-screen items-center relative top-14 p-2">
                {job && (
                    <div className="bg-zinc-800 text-white rounded-xl shadow-md border border-zinc-700 hover:shadow-lg transition h-fit">
                        <div className={`grid gap-8 p-4 ${job.imageUrl ? "md:grid-cols-2" : "grid-cols-1"}`}>
                            {/* Text Content */}
                            <div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-semibold">
                                        <span className="text-gray-400">Title:</span> {job.title}
                                    </div>
                                    <div className="text-lg">
                                        <span className="text-gray-400 font-medium text-2xl">Budget:</span>{" "}
                                        {formatEther(job.budget)} ETH
                                    </div>
                                    <div className="text-lg">
                                        <span className="text-gray-400 font-medium text-2xl">Status:</span>{" "}
                                        {job.status}
                                    </div>
                                </div>

                                {job.metadata?.description && (
                                    <div className="mt-4 space-y-2 text-sm">
                                        <div>
                                            <p className="text-gray-400 font-medium text-2xl">Description:</p>
                                            <p className="text-white whitespace-pre-line text-xl max-w-[35rem]">
                                                {job.metadata.description}
                                            </p>
                                        </div>

                                        {job.metadata.techStack && (
                                            <p className="text-lg">
                                                <span className="text-gray-400 font-medium text-2xl">Tech Stack:</span>{" "}
                                                {job.metadata.techStack}
                                            </p>
                                        )}

                                        {job.metadata.links && (
                                            <p>
                                                <span className="text-gray-400 font-medium text-2xl">Work Link:</span>{" "}
                                                <a
                                                    href={job.metadata.links}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-400 underline break-all text-xl"
                                                >
                                                    {job.metadata.links}
                                                </a>
                                            </p>
                                        )}

                                        {
                                            (job.status === "Submitted" || job.status === "Disputed") && (job.client?.toLowerCase() === account.toLowerCase() || job.freelancer?.toLowerCase() === account.toLowerCase()) && (
                                                <p>
                                                    <span className="text-gray-400 font-medium text-2xl">Sumitted Work Link:</span>{" "}
                                                    <a
                                                        href={job.submissionCID}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-400 underline break-all text-xl"
                                                    >
                                                        {job.submissionCID}
                                                    </a>
                                                </p>
                                            )
                                        }
                                    </div>
                                )}
                            </div>

                            {/* Image (optional) */}
                            {job.imageUrl && (
                                <div className="mb-4">
                                    <img
                                        src={job.imageUrl}
                                        alt="Job Banner"
                                        className="w-full max-w-md h-auto object-contain rounded-md"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Bid Section */}
                        {job.status === 'Open' && job.client?.toLowerCase() !== account?.toLowerCase() && (
                            <div className="mt-4 space-y-2 p-4 flex flex-col">
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder="Enter bid amount in ETH"
                                    className="w-full px-3 py-2 rounded border border-gray-300 placeholder:text-gray-400 text-white bg-zinc-900"
                                />
                                <button
                                    onClick={handlePlaceBid}
                                    disabled={placeBidLoading}
                                    className={`w-full px-4 py-2 text-white rounded flex items-center justify-center gap-2 font-semibold transition-colors duration-300 ${placeBidLoading
                                        ? 'bg-blue-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {placeBidLoading && <LoadingSpinner size="w-4 h-4" />}
                                    {placeBidLoading ? 'Placing Bid...' : 'Place Bid'}
                                </button>
                            </div>
                        )}

                        {job.status === "In Progress" && job.freelancer?.toLowerCase() === account?.toLowerCase() && (
                            <div className="mt-4 space-y-2 p-4 flex flex-col">
                                <input
                                    type="text"
                                    value={submittedWork}
                                    onChange={(e) => setSubmittedWork(e.target.value)}
                                    placeholder="Enter link of your work to submit"
                                    className="w-full px-3 py-2 rounded border border-gray-300 placeholder:text-gray-400 text-white bg-zinc-900"
                                />
                                <button
                                    onClick={handleSubmitWork}
                                    className={`w-full px-4 py-2 text-white rounded cursor-pointer flex items-center justify-center gap-2 font-semibold transition-colors duration-300 ${submitWorkLoading
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    disabled={submitWorkLoading}
                                >
                                    {submitWorkLoading && <LoadingSpinner size="w-4 h-4" />}
                                    {submitWorkLoading ? 'Submitting...' : 'Submit Work'}
                                </button>
                            </div>
                        )}

                        {job.status === "Submitted" && (
                            <div className="mt-4 space-y-2 p-4 flex flex-col">
                                {
                                    job.client?.toLowerCase() === account?.toLowerCase() && (
                                        <button
                                            onClick={handleApprove}
                                            className={`w-full px-4 py-2 text-white rounded cursor-pointer flex items-center justify-center gap-2 font-semibold transition-colors duration-300 ${approveWorkLoading
                                                ? 'bg-blue-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                            disabled={approveWorkLoading}
                                        >
                                            {approveWorkLoading && <LoadingSpinner size="w-4 h-4" />}
                                            {approveWorkLoading ? 'Approving...' : 'Approve Work'}
                                        </button>
                                    )
                                }
                                {
                                    (job.freelancer?.toLowerCase() === account?.toLowerCase() || job.client?.toLowerCase() === account?.toLowerCase()) && (
                                        <button
                                            onClick={handleDispute}
                                            className={`w-full px-4 py-2 text-white rounded cursor-pointer flex items-center justify-center gap-2 font-semibold transition-colors duration-300 ${disputeLoading
                                                ? 'bg-red-400 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700'
                                                }`}
                                            disabled={disputeLoading}
                                        >
                                            {disputeLoading && <LoadingSpinner size="w-4 h-4" />}
                                            {disputeLoading ? 'Raising Dispute...' : 'Raise Dispute'}
                                        </button>
                                    )
                                }

                            </div>
                        )}

                        {job.status === "Disputed" && (
                            <div className="mt-4 space-y-2 p-4 flex flex-col">
                                {admin?.toLowerCase() === account?.toLowerCase() && (
                                    <div>
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-white text-xl mb-2">Resolve Dispute In Favor Of:</h4>
                                            <div className="flex gap-2">

                                                {/* Option 1: The Client */}
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        id="payClient"
                                                        name="disputeWinner"
                                                        value="client"
                                                        className="h-4 w-4 cursor-pointer"
                                                        onChange={handleSelectionChange}
                                                        checked={selectedWinner === 'client'}
                                                    />
                                                    <label
                                                        htmlFor="payClient"
                                                        className={`ml-2 cursor-pointer text-[1.1rem] font-medium ${selectedWinner === 'client' ? 'text-red-500' : 'text-white'
                                                            }`}
                                                    >
                                                        The Client
                                                    </label>
                                                </div>

                                                {/* Option 2: The Freelancer */}
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        id="payFreelancer"
                                                        name="disputeWinner"
                                                        value="freelancer"
                                                        className="h-4 w-4 cursor-pointer"
                                                        onChange={handleSelectionChange}
                                                        checked={selectedWinner === 'freelancer'}
                                                    />
                                                    <label
                                                        htmlFor="payFreelancer"
                                                        className={`ml-2 cursor-pointer text-[1.1rem] font-medium ${selectedWinner === 'freelancer' ? 'text-red-500' : 'text-white'
                                                            }`}
                                                    >
                                                        The Freelancer
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleResolveDispute}
                                            className={`w-full px-4 py-2 text-white rounded cursor-pointer flex items-center justify-center gap-2 font-semibold transition-colors duration-300 ${resolveDisputeLoading || !selectedWinner
                                                ? 'bg-green-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700'
                                                }`}
                                            disabled={resolveDisputeLoading || !selectedWinner} // Also disable button if no selection is made
                                        >
                                            {resolveDisputeLoading && <LoadingSpinner size="w-4 h-4" />}
                                            {resolveDisputeLoading ? 'Resolving...' : 'Resolve Dispute'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Show bid list */}
                        <BidList
                            bids={bids}
                            jobClient={job.client}
                            jobFreelancer={job.freelancer}
                            selectFreelancer={handleSelectFreelancer}
                            selectFreelancerLoading={selectFreelancerLoading}
                            selectedBidderAddress={selectedBidderAddress}
                            withdrawLoading={withdrawLoading}
                            status={job.status}
                            handleWithdraw={handleWithdraw}
                        />
                    </div>
                )}
            </div>
        </div>
    );

}

export default JobPage;