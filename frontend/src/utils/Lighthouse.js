import lighthouse from '@lighthouse-web3/sdk';

export const uploadJobFolderToLighthouse = async (metadata, imageFile) => {
    const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;

    // Upload the image separately
    let imageCID = "";
    if (imageFile) {
        const imageResponse = await lighthouse.uploadBuffer(imageFile, apiKey);
        imageCID = imageResponse.data.Hash;

    }

    // Add the imageCID to metadata (optional: for frontend convenience)
    const metadataWithImage = {
        ...metadata,
        imageCID,
    };

    const metadataFile = new File(
        [JSON.stringify(metadataWithImage)],
        "metadata.json",
        { type: "application/json" }
    );

    // Upload the metadata JSON
    const metadataResponse = await lighthouse.uploadBuffer(metadataFile, apiKey);
    const metadataCID = metadataResponse.data.Hash;

    return { metadataCID, imageCID };
};

export const fetchFromLighthouse = async (cid) => {
    if (!cid || cid.trim() === "") {
        return null;
    }

    try {
        const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from IPFS: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching from IPFS:", error);
        return null;
    }
};
