import React, { useContext, useEffect, useState } from 'react'
import { ChainContext } from '../context/ChainContextProvider'
import JobsList from '../components/JobList';

function AdminPanel() {
    const { account, admin } = useContext(ChainContext);
    console.log("Admin: ", admin)


    if (account.toLowerCase() !== admin.toLowerCase()) {
        return (
            <div className={`w-full h-screen flex justify-center items-center bg-gray-950`}>
                <div className={`text-4xl text-white font-semibold absolute top-16 flex justify-center items-center h-full`}>
                    You are not the admin {`;<`}
                </div>
            </div>
        )
    }
    return (
        <div className=" min-h-screen bg-gray-950 flex pb-16">
            <div className={`w-full relative top-14 border-2 border-red-600 flex `}>
                <JobsList jobStatus="Disputed" />
            </div>
        </div>
    )
}

export default AdminPanel