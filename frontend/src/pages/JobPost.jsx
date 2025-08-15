import React, { useContext } from 'react'
import CreateJobForm from '../components/CreateJobForm'
import { ChainContext } from '../context/ChainContextProvider'

function JobPost() {
    const { contract, signer } = useContext(ChainContext);
    return (
        <div className="min-h-screen bg-gray-950 w-full flex justify-center items-start py-20">
            <div className="w-11/12 md:w-7/12 bg-zinc-800 flex flex-col items-center p-6 rounded-2xl shadow-2xl">

                {/* Heading */}
                <h2 className="w-full text-center text-3xl md:text-4xl font-bold text-white mb-1 pb-3">
                    Create Job
                </h2>

                {/* Form Container */}
                {/* <div className="w-full md:w-4/5 bg-zinc-900 border border-zinc-700 p-6 rounded-xl"> */}
                <CreateJobForm contract={contract} signer={signer} />
                {/* </div> */}

            </div>
        </div>


    )
}

export default JobPost