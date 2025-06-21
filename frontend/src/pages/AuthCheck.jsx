import React from 'react'
import { ChainContextProvider } from '../context/ChainContextProvider'
import Layout from './Layout'

function AuthCheck() {
    return (
        <ChainContextProvider>
            <Layout />
        </ChainContextProvider>
    )
}

export default AuthCheck