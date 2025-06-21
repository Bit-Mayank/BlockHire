

export const fetchJobs = async (jobStatus, contract) => {
    try {
        if (!window.ethereum) throw new Error("Please install MetaMask");

        let Jobs = [];

        if (jobStatus === "Open") {
            Jobs = await contract.listOpenJobs();
        }

        const jobDetails = await Promise.all(
            Jobs.map(async (job) => {
                const id = job.jobId;
                const cid = job.specCID;
                let metadata = {};
                let imageUrl = "";

                try {
                    const metadataRes = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
                    metadata = await metadataRes.json();

                    if (metadata.imageCID) {
                        imageUrl = `https://gateway.lighthouse.storage/ipfs/${metadata.imageCID}`;
                    }
                } catch (e) {
                    console.warn(`Could not load metadata from IPFS CID ${cid}`, e);
                }

                return {
                    jobId: id.toString(),
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

        return jobDetails;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to load job details.");
    }
};
