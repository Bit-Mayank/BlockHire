import React, { useContext } from 'react'
import CreateJobForm from '../components/CreateJobForm'
import { ChainContext } from '../context/ChainContextProvider'

function JobPost() {
    const { contract, signer } = useContext(ChainContext);
    return (
        <div className="min-h-screen bg-gray-950 w-full flex justify-center items-start py-20">
            <div className="w-11/12 md:w-7/12 bg-gray-300 flex flex-col items-center p-6 rounded-2xl shadow-lg">
                {/* Heading */}
                <h2 className="w-full md:w-4/5 text-center text-2xl md:text-3xl font-bold text-purple-600 mb-6 border-b-4 border-puple-500 pb-2">
                    Create Job
                </h2>

                {/* Form */}
                <div className="w-full md:w-4/5 border-4 border-purple-500 p-6 rounded-lg">
                    <CreateJobForm contract={contract} signer={signer} />
                </div>
            </div>
        </div>

    )
}

export default JobPost