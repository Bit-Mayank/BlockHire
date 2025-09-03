
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChainContext } from '../context/ChainContextProvider';
import { uploadJobFolderToLighthouse } from '../utils/Lighthouse';

function EditProfile() {
    const { contract, account, signer } = useContext(ChainContext);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Handle file input
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    // Save profile to IPFS and update on-chain
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // Prepare metadata
            const metadata = {
                displayName,
                bio,
            };
            // Upload to Lighthouse (IPFS)
            const { metadataCID, imageCID } = await uploadJobFolderToLighthouse(metadata, imageFile);
            // Save profileCID on-chain
            const tx = await contract.connect(signer).updateProfileCID(metadataCID);
            await tx.wait();
            setSuccess('Profile updated successfully!');
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            setError('Failed to update profile. ' + (err?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex justify-center items-center pb-20">
            <div className="bg-zinc-800 text-white min-w-[25rem] max-w-10/12 p-8 rounded-xl shadow-md relative top-16 w-full md:w-2/3 lg:w-1/2">
                <h1 className="text-3xl font-bold mb-6 text-yellow-400">Edit Profile</h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-lg font-medium mb-1 text-gray-200">Display Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded bg-gray-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder="Your name or handle"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium mb-1 text-gray-200">Bio</label>
                        <textarea
                            className="w-full px-4 py-2 rounded bg-gray-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium mb-1 text-gray-200">Profile Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full text-gray-300"
                            onChange={handleImageChange}
                        />
                    </div>
                    {error && <div className="text-red-500 font-medium">{error}</div>}
                    {success && <div className="text-green-400 font-medium">{success}</div>}
                    <div className="flex gap-4 mt-4">
                        <button
                            type="submit"
                            className="bg-yellow-400 text-red-600 font-bold px-6 py-2 rounded-lg shadow hover:bg-yellow-300 transition disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                            onClick={() => navigate('/profile')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfile;