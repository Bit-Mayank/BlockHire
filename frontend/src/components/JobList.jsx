import React, { useCallback, useContext, useEffect, useState } from "react";
import { ChainContext } from "../context/ChainContextProvider";
import { fetchJobs } from "../utils/fetchJobs";
import JobCard from "./JobCard";

const JobsList = ({ jobStatus }) => {
    const { account, contract } = useContext(ChainContext);
    const [jobs, setJobs] = useState([]);

    const loadJobs = useCallback(async () => {
        if (account && contract) {
            console.log("Fetching jobs...");
            const fetchedJobs = await fetchJobs(jobStatus, contract);
            setJobs(fetchedJobs);
        }
    }, [account, contract, jobStatus]); // Keep your original dependencies

    useEffect(() => {
        // Fetch jobs when the component first loads
        loadJobs();

        // Add an event listener to re-fetch when the window gets focus
        window.addEventListener('focus', loadJobs);

        // ✅ Important: Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('focus', loadJobs);
        };
    }, [loadJobs]);


    if (jobs.length === 0) {
        return (
            <div className=" text-3xl flex justify-center items-center w-full h-full text-white font-bold">
                No Jobs Available
            </div>

        )
    }


    return (
        <div className="w-full px-4 sm:px-6 lg:px-12 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <JobCard key={job.jobId} job={job} />
                ))}
            </div>
        </div>

    );
};

export default JobsList;
