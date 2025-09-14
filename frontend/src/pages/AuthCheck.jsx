import React from 'react'
import { ChainContextProvider } from '../context/ChainContextProvider'
import { ToastProvider } from '../context/ToastProvider'
import Layout from './Layout'

function AuthCheck() {
    return (
        <ChainContextProvider>
            <ToastProvider>
                <Layout />
            </ToastProvider>
        </ChainContextProvider>
    )
}

export default AuthCheck