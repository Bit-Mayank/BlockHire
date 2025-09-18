import React, { useContext, useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChainContext } from '../context/ChainContextProvider';
import { formatEther } from 'ethers';
import { fetchFromLighthouse } from '../utils/Lighthouse';

function BidderProfile() {
    const { bidderAddress } = useParams();
    const { contract } = useContext(ChainContext);
    const [profile, setProfile] = useState(null);
    const [profileMetadata, setProfileMetadata] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!contract || !bidderAddress) return;

        setLoading(true);
        try {
            const userProfile = await contract.getFullUserProfile(bidderAddress);
            setProfile(userProfile);
            if (userProfile.profileCID && userProfile.profileCID.trim() !== "") {
                try {
                    const metadata = await fetchFromLighthouse(userProfile.profileCID);
                    setProfileMetadata(metadata);
                } catch (ipfsErr) {
                    console.error("Failed to fetch profile metadata from IPFS:", ipfsErr);
                    setProfileMetadata(null);
                }
            } else {
                setProfileMetadata(null);
            }
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
                                {profileMetadata ? (
                                    <div className="bg-zinc-700 p-6 rounded-lg mb-6">
                                        <div className="flex items-start gap-4">
                                            {profileMetadata.imageCID && (
                                                <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-600 flex-shrink-0">
                                                    <img
                                                        src={`https://gateway.lighthouse.storage/ipfs/${profileMetadata.imageCID}`}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                {profileMetadata.displayName && (
                                                    <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                                                        {profileMetadata.displayName}
                                                    </h2>
                                                )}
                                                {profileMetadata.bio && (
                                                    <p className="text-gray-300 leading-relaxed">
                                                        {profileMetadata.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-zinc-700 p-6 rounded-lg mb-6 text-center">
                                        <p className="text-gray-400">This user has not set up their profile yet.</p>
                                    </div>
                                )}
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