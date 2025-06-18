// scripts/saveFrontendFiles.js

const fs = require("fs");
const path = require("path");

function saveFrontendFiles(address, contractName) {
    const frontendDir = path.resolve(__dirname, "../frontend/src/constants");

    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }

    // Save contract address
    fs.writeFileSync(
        path.join(frontendDir, `${contractName}-address.json`),
        JSON.stringify({ address: address }, null, 2)
    );

    // Save contract ABI
    const artifact = artifacts.readArtifactSync(contractName);
    fs.writeFileSync(
        path.join(frontendDir, `${contractName}.json`),
        JSON.stringify(artifact, null, 2)
    );
}

module.exports = { saveFrontendFiles };
