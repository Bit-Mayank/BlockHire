import React, { useContext, useEffect, useState } from "react";
import { ChainContext } from "../context/ChainContextProvider";
import { fetchJobs } from "../utils/fetchJobs";
import JobCard from "./JobCard";

const JobsList = ({ jobStatus }) => {
    const { account, contract } = useContext(ChainContext);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {

        const loadJobs = async () => {
            const fetchedJobs = await fetchJobs(jobStatus, contract)
            setJobs(fetchedJobs)
        }
        if (account && contract) {
            loadJobs();
        }
    }, [account, contract, jobStatus]);


    return (
        <div className="w-full px-4 sm:px-6 lg:px-12 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>

    );
};

export default JobsList;
