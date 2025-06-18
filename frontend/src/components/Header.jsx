import React, { useContext } from 'react'
import { Link, NavLink } from 'react-router'
import { ChainContext } from '../context/ChainContextProvider'
import ProfileLogo from '../assets/ProfileLogo.jsx'

function Header() {
    const { account, loadBlockchain } = useContext(ChainContext);
    return (
        <div className="bg-violet-700 h-[3rem] flex items-center justify-between absolute w-11/12 left-18 top-2 rounded-2xl px-4">
            {/* Centered NavLinks */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-4">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `bg-yellow-400 px-3 py-1 rounded ${isActive ? "text-red-600" : ""}`
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/about"
                    className={({ isActive }) =>
                        `bg-yellow-400 px-3 py-1 rounded ${isActive ? "text-red-600" : ""}`
                    }
                >
                    About
                </NavLink>
                {
                    account && <NavLink to="/createJob" className={({ isActive }) =>
                        `bg-yellow-400 px-3 py-1 rounded ${isActive ? "text-red-600" : ""}`
                    }>Post Job</NavLink>
                }
            </div>

            {/* Right-side Connect/Account */}
            <div className="ml-auto">
                {account ? (
                    <NavLink to="/profile" className="text-white font-mono flex">
                        <ProfileLogo className={`w-8 h-8 mr-1.5`} />
                        {`${account.slice(0, 6)}...${account.slice(-4)}`}
                    </NavLink>
                ) : (
                    <button
                        onClick={loadBlockchain}
                        className="text-white bg-green-600 px-3 py-1 rounded cursor-pointer"
                    >
                        Connect
                    </button>
                )}
            </div>
        </div>


    )
}

export default Header