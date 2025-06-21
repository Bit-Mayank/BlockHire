import React, { useContext, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChainContext } from '../context/ChainContextProvider';
import { formatEther } from 'ethers';

function BidderProfile() {
    const { bidderAddress } = useParams();
    const { contract } = useContext(ChainContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!contract || !bidderAddress) return;

        setLoading(true);
        try {
            const userProfile = await contract.getFullUserProfile(bidderAddress);
            setProfile(userProfile);
        } catch (err) {
            console.error("Failed to fetch user profile", err);
        } finally {
            setLoading(false);
        }
    }, [bidderAddress, contract]);

    useEffect(() => {
        fetchProfile();
    }, [contract, bidderAddress, fetchProfile]);


    return (
        <div className="min-h-screen bg-gray-950 flex justify-center items-center">
            <div className="bg-zinc-800 text-white w-full max-w-xl p-8 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold mb-6">Bidder Profile:</h1>

                {loading ? (
                    <div className="text-gray-400">Loading profile...</div>
                ) :
                    (
                        profile ? (
                            <div className="space-y-4 text-lg">
                                <div className="flex justify-between">
                                    <span className="font-medium">Total Spent:</span>
                                    <span>{formatEther(profile.totalSpent)} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Total Earned:</span>
                                    <span>{formatEther(profile.totalEarned)} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Jobs Posted:</span>
                                    <span>{profile.jobsPosted?.length ? profile.jobsPosted?.length : 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Jobs Completed:</span>
                                    <span>{profile.jobsCompleted?.length ? profile.jobsCompleted?.length : 0}</span>
                                </div>

                            </div>
                        ) : (
                            <span className="text-red-500">Profile not found. Try reconnecting wallet.</span>
                        )
                    )
                }
            </div>
        </div>
    )
}

export default BidderProfile