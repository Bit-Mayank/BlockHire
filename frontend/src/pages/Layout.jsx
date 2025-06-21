import { useLocation, Navigate } from 'react-router-dom';
import { ChainContext } from '../context/ChainContextProvider';
import { useContext } from 'react';
import Header from "../components/Header";
import { Outlet } from 'react-router';
import ConnectWallet from '../components/ConnectWallet';

function Layout() {
    const { account, isRegistered } = useContext(ChainContext);
    const location = useLocation();

    const isProfileRoute = location.pathname === '/profile';

    const shouldShowConnectWallet =
        !account || (account && !isRegistered && !isProfileRoute);

    return (
        <>
            <Header />
            {shouldShowConnectWallet ? <ConnectWallet /> : <Outlet />}
        </>
    );
}

export default Layout
