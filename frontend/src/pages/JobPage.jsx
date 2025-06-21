import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { formatEther, parseEther } from 'ethers';
import { ChainContext } from '../context/ChainContextProvider';
import BidList from '../components/BidList';
import { getStatus } from '../utils/jobUtils';

function JobPage() {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const { contract, signer, account } = useContext(ChainContext);
    const [bidAmount, setBidAmount] = useState('');
    const [bids, setBids] = useState([]);
    const [loading, setIsLoading] = useState(false);

    const handleSelectFreelancer = async (bidderAddress) => {
        try {
            setIsLoading(true)
            const tx = await contract.selectFreelancer(jobId, bidderAddress, {
                value: job.budget.toString()
            });
            await tx.wait();
            alert("Freelancer selected!");
            setIsLoading(false)
        } catch (err) {
            setIsLoading(false)
            console.error("Failed to select freelancer:", err);
        }
    };

    const handlePlaceBid = async () => {
        if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
            alert('Please enter a valid bid amount.');
            return;
        }

        setIsLoading(true);

        try {
            const tx = await contract.connect(signer).placeBid(Number(jobId), {
                value: parseEther(bidAmount),
            });
            const receipt = await tx.wait();

            alert('Bid placed successfully!');
            if (receipt.status === 1) {
                setBidAmount('');
            } else {
                alert('Transaction failed.');
            }
            setIsLoading(false)
        } catch (err) {
            console.error('Failed to place bid:', err);
            setIsLoading(false)
            alert('Transaction failed: ' + (err.reason || err.message || 'Unknown error'));
        }
    };

    const handleWithdraw = async () => {
        try {

            setIsLoading(true);
            const response = await contract.connect(signer).refundBid(jobId);
            await response.wait();

            alert("Withdrawl Successful");
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            alert("Something went wrong with withdraw");
            console.error("BidList: handleWithdraw: ", e)
        }
    }

    useEffect(() => {
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
                    metadata,
                    imageUrl,
                };

                setJob(jobDetails);
            } catch (err) {
                console.error('Failed to fetch job details', err);
            }
        };

        const fetchBids = async () => {
            const jobBids = await contract.listBids(jobId);
            setBids(jobBids);
        };

        if (contract && jobId) {
            fetchJob();
            fetchBids();
        }
    }, [contract, jobId, loading]);

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
                                                <span className="text-gray-400 font-medium text-2xl">Links:</span>{" "}
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
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                >
                                    Place Bid
                                </button>
                            </div>
                        )}


                        {/* Show bid list */}
                        <BidList
                            bids={bids}
                            jobClient={job.client}
                            selectFreelancer={handleSelectFreelancer}
                            loading={loading}
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