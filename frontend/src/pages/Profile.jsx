import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatEther } from 'ethers';
import { ChainContext } from '../context/ChainContextProvider';
import { getStatus } from '../utils/jobUtils';
import JobCard from '../components/JobCard';

function Profile() {
    const { contract, account, signer, isRegistered, setIsRegistered } = useContext(ChainContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [postedJobs, setPostedJobs] = useState([]);
    const [biddedJobs, setBiddedJobs] = useState([]);
    const [openJobs, setOpenJobs] = useState([]);
    const [assignedJobs, setAssignedJobs] = useState([]);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [disputedJobs, setDisputedJobs] = useState([]);
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            setIsRegistering(true);
            const isRegistered = await contract.isUserRegistered(account);
            if (!isRegistered) {
                const tx = await contract.connect(signer).registerUser(); // uses default profileCID = ""
                await tx.wait();
                setIsRegistered(true);
                console.log("User registered on-chain");
                fetchProfile();
            }
            setIsRegistering(false);
        } catch (err) {
            setIsRegistering(false);
            console.error("User registration check failed:", err);
        }
    }

    const fetchProfile = useCallback(async () => {
        if (!contract || !account) return;

        try {
            const registered = await contract.isUserRegistered(account);
            if (!registered) {
                setIsRegistered(false);
                setLoading(false);
                return;
            }
            setIsRegistered(true);
            const userProfile = await contract.getFullUserProfile(account);
            setProfile(userProfile);
        } catch (err) {
            console.error("Failed to fetch user profile", err);
        } finally {
            setLoading(false);
        }
    }, [account, contract, setIsRegistered]);

    useEffect(() => {
        fetchProfile();
    }, [contract, account, fetchProfile]);

    useEffect(() => {

        const fetchJobs = async () => {
            if (!profile) return;

            try {
                const postedJobs = await contract.getJobsByIds([...profile.jobsPosted]);
                const biddedJobs = await contract.getJobsByIds([...profile.jobsBidOn]);
                setPostedJobs(postedJobs);
                setBiddedJobs(biddedJobs)


                const open = [];
                const assigned = [];
                const pending = [];
                const closed = [];
                // const bidded = [];
                const disputed = [];

                postedJobs?.forEach((job) => {
                    const status = getStatus(job.status);

                    if (status === "Open") open.push(job);
                    else if (status === "In Progress") assigned.push(job);
                    else if (status === "Submitted") pending.push(job);
                    else if (status === "Closed") closed.push(job);
                    else if (status === "Disputed") disputed.push(job);
                });

                // biddedJobs?.forEach((job) => { bidded.push(job) });

                // console.log(bidded)

                setOpenJobs(open);
                setAssignedJobs(assigned);
                setPendingJobs(pending);
                setCompletedJobs(closed);
                setDisputedJobs(disputed);
                // setBiddedJobs(bidded)
            } catch (err) {
                console.error("Profile Page: fetchJobs: ", err);
            }
        }

        fetchJobs();
    }, [contract, profile])

    return (
        <div className="min-h-screen bg-gray-950 flex justify-center items-center pb-20">
            <div className="bg-zinc-800 text-white min-w-[25rem] max-w-10/12 p-8 rounded-xl shadow-md relative top-16">
                <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

                {loading ? (
                    <div className="text-gray-400">Loading profile...</div>
                ) :
                    isRegistered ? (
                        profile ? (
                            <div className="space-y-4 text-lg">
                                <div className="flex gap-4">
                                    <span className="font-medium">Total Spent:</span>
                                    <span>{formatEther(profile.totalSpent)} ETH</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-medium">Total Earned:</span>
                                    <span>{formatEther(profile.totalEarned)} ETH</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-medium">Jobs Posted:</span>
                                    <span>{profile.jobsPosted?.length ? profile.jobsPosted?.length : 0}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="font-medium">Jobs Completed:</span>
                                    <span>{profile.jobsCompleted?.length ? profile.jobsCompleted?.length : 0}</span>
                                </div>
                                <button
                                    className=" mb-[2rem] bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                                    onClick={() => navigate('/edit-profile')}
                                >
                                    Edit Profile
                                </button>

                                <div className={` text-2xl flex justify-center font-semibold underline`}>
                                    Jobs Posted By You
                                </div>

                                {/* Jobs with open status posted by user */}
                                {postedJobs.length > 0 ? (
                                    <div>
                                        {openJobs.length > 0 && (
                                            <>
                                                <div className="text-xl font-semibold mb-2">Opened Jobs:</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {openJobs.map((job) => (
                                                        <JobCard key={job.jobId} job={job} />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {assignedJobs.length > 0 && (
                                            <>
                                                <div className="text-xl font-semibold mb-2">Assigned Jobs:</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {assignedJobs.map((job) => (
                                                        <JobCard key={job.jobId} job={job} />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {pendingJobs.length > 0 && (
                                            <>
                                                <div className="text-xl font-semibold mb-2">Pending to Approve:</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {pendingJobs.map((job) => (
                                                        <JobCard key={job.jobId} job={job} />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {completedJobs.length > 0 && (
                                            <>
                                                <div className="text-xl font-semibold mb-2">Jobs Completed by User:</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {completedJobs.map((job) => (
                                                        <JobCard key={job.jobId} job={job} />
                                                    )
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {disputedJobs.length > 0 && (
                                            <>
                                                <div className="text-xl font-semibold mb-2">Disputed Jobs:</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {disputedJobs.map((job) => (
                                                        <JobCard key={job.jobId} job={job} />
                                                    )
                                                    )}
                                                </div>
                                            </>
                                        )}

                                    </div>
                                ) : (
                                    <div className="text-md text-gray-400">No Jobs Posted yet</div>
                                )}

                                <div className={` text-2xl flex justify-center font-semibold underline`}>
                                    Jobs Bidded By You
                                </div>

                                {biddedJobs?.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-3 gap-2">
                                            {biddedJobs.map((job) =>
                                            (
                                                <JobCard key={job.jobId} job={job} />
                                            )
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-md text-gray-400">No Jobs to show</div>
                                )}

                            </div>
                        ) : (
                            <span className="text-red-500">Profile not found. Try reconnecting wallet.</span>
                        )
                    ) : (
                        <div className="flex flex-col items-start space-y-4">
                            <span className="text-lg">You haven't registered your profile yet.</span>
                            <button
                                disabled={isRegistering}
                                onClick={handleRegister}
                                className={`bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isRegistering ? "Registering..." : "Register Your Profile"}
                            </button>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default Profile;
