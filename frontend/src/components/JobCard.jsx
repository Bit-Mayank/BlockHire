import React from "react";
import { formatEther } from "ethers";
import { useNavigate } from "react-router"

const JobCard = ({ job }) => {
    const navigate = useNavigate();

    return (
        <div className=" bg-zinc-800 text-white rounded-xl shadow-md border border-zinc-700 hover:shadow-lg transition h-fit cursor-pointer"
            onClick={() => {
                const jobLink = "/job/" + job.id.toString();
                navigate(jobLink)
            }}
        >

            <div className={`flex flex-col-2 gap-2 p-4`}>
                {/* Job Info */}
                <div>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold">
                            <span className="text-gray-400">Title:</span> {job.title}
                        </p>
                        <p>
                            <span className="text-gray-400 font-medium">Budget:</span>{" "}
                            {formatEther(job.budget)} ETH
                        </p>
                        <p>
                            <span className="text-gray-400 font-medium">Status:</span>{" "}
                            {job.status}
                        </p>
                    </div>

                    {/* Metadata */}
                    {job.metadata?.description && (
                        <div className="mt-4 space-y-2 text-sm">

                            {job.metadata.techStack && (
                                <p>
                                    <span className="text-gray-400 font-medium">Tech Stack:</span>{" "}
                                    {job.metadata.techStack}
                                </p>
                            )}

                        </div>
                    )}
                </div>

                {/* Job Image */}
                {job.imageUrl && (
                    <div className="mb-4">
                        <img
                            src={job.imageUrl}
                            alt="Job Banner"
                            className="w-full h-44 object-contain rounded-md"
                        />
                    </div>
                )}
            </div>

        </div>

    );
};

export default JobCard;
