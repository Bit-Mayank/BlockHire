import React, { useContext } from 'react'
import { formatEther } from 'ethers'
import { ChainContext } from '../context/ChainContextProvider'
import { useNavigate } from "react-router"
import LoadingSpinner from './LoadingSpinner'

function BidCard({ bid, jobClient, jobFreelancer, selectFreelancer, selectFreelancerLoading, selectedBidderAddress, withdrawLoading, status, handleWithdraw }) {

    const { account } = useContext(ChainContext);
    const navigate = useNavigate();

    // Check if this specific bid is being selected
    const isSelectingThisBid = selectFreelancerLoading && selectedBidderAddress?.toLowerCase() === bid.bidder.toLowerCase();

    // Check if this is the user's own bid for withdraw functionality
    const isUserBid = bid.bidder.toLowerCase() === account?.toLowerCase();

    // Check if this bidder is the selected freelancer (should not be able to withdraw)
    const isSelectedFreelancer = jobFreelancer && bid.bidder.toLowerCase() === jobFreelancer.toLowerCase();
    return (
        <div
            className="border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
        >
            <div className={`mr-2`}>
                <p><span className="font-medium">Bidder:</span> {bid.bidder}</p>
                <p><span className="font-medium">Amount:</span> {formatEther(bid.amount)} ETH</p>
                {bid.message && (
                    <p><span className="font-medium">Message:</span> {bid.message}</p>
                )}
            </div>

            {
                account?.toLowerCase() === bid.bidder?.toLowerCase() && bid.amount > 0 && !isSelectedFreelancer && (
                    <div className={` flex`}>
                        <button
                            onClick={handleWithdraw}
                            className={`mt-3 sm:mt-0 font-semibold py-2 px-2 rounded-lg cursor-pointer text-white flex items-center justify-center gap-2 transition-colors duration-300 ${withdrawLoading && isUserBid
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            disabled={withdrawLoading && isUserBid}
                        >
                            {withdrawLoading && isUserBid && <LoadingSpinner size="w-4 h-4" />}
                            {withdrawLoading && isUserBid ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                    </div>
                )
            }

            {account?.toLowerCase() === jobClient?.toLowerCase() && bid.amount > 0 && (
                <div className={`flex gap-2`}>
                    <button
                        onClick={() => navigate(`/bidder/${bid.bidder.toLowerCase()}`)}
                        className="mt-3 sm:mt-0 font-semibold py-2 px-4 rounded-lg cursor-pointer text-white bg-green-600 hover:bg-green-700 transition-colors duration-300"
                    >
                        View Profile
                    </button>
                    {status === "Open" && <button
                        onClick={() => selectFreelancer(bid.bidder)}
                        disabled={isSelectingThisBid}
                        className={`mt-3 sm:mt-0 font-semibold py-2 px-2 rounded-lg cursor-pointer text-white flex items-center justify-center gap-2 transition-colors duration-300 ${isSelectingThisBid
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isSelectingThisBid && <LoadingSpinner size="w-4 h-4" />}
                        {isSelectingThisBid ? 'Selecting...' : 'Select Freelancer'}
                    </button>}

                </div>

            )}
        </div>
    )
}

export default BidCard