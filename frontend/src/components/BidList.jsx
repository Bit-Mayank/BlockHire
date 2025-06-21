import React, { useContext } from 'react';
import { ChainContext } from '../context/ChainContextProvider';
import { formatEther } from 'ethers';
import { useNavigate } from 'react-router';

const BidList = ({ bids, jobClient, selectFreelancer, loading, status, handleWithdraw }) => {
    const { account } = useContext(ChainContext);
    const navigate = useNavigate();

    if (!bids || bids.length === 0) {
        return <div className="p-4 text-gray-600">No bids yet.</div>;
    }

    return (

        <div className="p-4 text-white rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-semibold mb-4">Bids</h2>

            <div className="space-y-4">
                {bids.map((bid, index) => {
                    return (
                        <div
                            key={index}
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
                                account?.toLowerCase() === bid.bidder?.toLowerCase() && bid.amount > 0 && (
                                    <div className={` flex`}>
                                        <button
                                            onClick={handleWithdraw}
                                            className={`mt-3 sm:mt-0 font-semibold py-2 px-2 rounded-lg cursor-pointer text-white ${loading
                                                ? 'bg-blue-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                            disabled={loading}
                                        >
                                            {loading ? 'Withdrawing...' : 'Withdraw'}
                                        </button>
                                    </div>
                                )
                            }

                            {account?.toLowerCase() === jobClient?.toLowerCase() && bid.amount > 0 && (
                                <div className={`flex gap-2`}>
                                    <button
                                        onClick={() => navigate(`/bidder/${bid.bidder.toLowerCase()}`)}
                                        className={`mt-3 sm:mt-0 font-semibold py-2 px-4 rounded-lg cursor-pointer text-white ${loading
                                            ? 'bg-green-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                    >
                                        View Profile
                                    </button>
                                    {status === "Open" && <button
                                        onClick={() => selectFreelancer(bid.bidder)}
                                        disabled={loading}
                                        className={`mt-3 sm:mt-0 font-semibold py-2 px-2 rounded-lg cursor-pointer text-white ${loading
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {loading ? 'Selecting...' : 'Select Freelancer'}
                                    </button>}

                                </div>

                            )}
                        </div>
                    )
                })}
            </div>
        </div>

    );
};

export default BidList;
