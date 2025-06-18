import React, { useContext, useEffect, useState } from "react";
import { ChainContext } from "../context/ChainContextProvider";

const JobsList = () => {
    const { account, contract } = useContext(ChainContext);
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadJobs = async () => {
            try {
                if (!window.ethereum) return setError("Please install MetaMask");

                const jobIds = await contract.jobsOf(account);
                const jobDetails = await Promise.all(
                    jobIds.map(async (id) => {
                        const job = await contract.jobs(id);
                        const cid = job.specCID;
                        // const imageCID = job.imageCID
                        // console.log(imageCID)

                        let metadata = {};
                        let imageUrl = "";
                        try {
                            const metadataRes = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
                            metadata = await metadataRes.json();
                            if (metadata.imageCID)
                                imageUrl = `https://gateway.lighthouse.storage/ipfs/${metadata.imageCID}`;
                            console.log(imageUrl);
                        } catch (e) {
                            console.warn(`Could not load metadata from IPFS CID ${cid}`, e);
                        }

                        return {
                            id: id.toString(),
                            title: job.title,
                            budget: job.budget.toString(),
                            status: job.status,
                            freelancer: job.freelancer,
                            specCID: cid,
                            metadata,
                            imageUrl,
                        };
                    })
                );

                setJobs(jobDetails);
            } catch (err) {
                console.error(err);
                setError("Failed to load job details.");
            }
        };

        if (account && contract) {
            loadJobs();
        }
    }, [account, contract]);

    const getStatus = (code) => {
        const statuses = [
            "Open",
            "In Progress",
            "Submitted",
            "Approved",
            "Disputed",
            "Closed",
            "Cancelled",
        ];
        return statuses[code] || "Unknown";
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Your Posted Jobs</h2>
            <p><strong>Connected Wallet:</strong> {account}</p>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {jobs.length > 0 ? (
                <ul>
                    {jobs.map((job) => (
                        <li key={job.id} style={{ border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem", borderRadius: "8px" }}>
                            <p><strong>Job ID:</strong> {job.id}</p>
                            <p><strong>Title:</strong> {job.title}</p>
                            <p><strong>Budget (wei):</strong> {job.budget}</p>
                            <p><strong>Status:</strong> {getStatus(Number(job.status))}</p>
                            <p><strong>Freelancer:</strong> {job.freelancer}</p>
                            <p><strong>IPFS CID:</strong> {job.specCID}</p>

                            {job.metadata?.description && (
                                <>
                                    <p><strong>Description:</strong> {job.metadata.description}</p>
                                    <p><strong>Tech Stack:</strong> {job.metadata.techStack}</p>
                                    <p><strong>Links:</strong> <a href={job.metadata.links} target="_blank" rel="noreferrer">{job.metadata.links}</a></p>
                                </>
                            )}

                            {job.imageUrl && (
                                <div>
                                    <strong>Image:</strong><br />
                                    <img src={job.imageUrl} alt="Job Banner" style={{ maxWidth: "300px", marginTop: "0.5rem" }} />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No jobs found.</p>
            )}
        </div>
    );
};

export default JobsList;
