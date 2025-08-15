
import { useContext, useEffect, useState } from 'react';
import { ChainContext } from '../context/ChainContextProvider';
import BidCard from './BidCard';


const BidList = ({ bids, jobClient, selectFreelancer, loading, status, handleWithdraw }) => {
    const { account } = useContext(ChainContext);
    const [userBid, setUserBid] = useState(null);

    useEffect(() => {
        bids.forEach(bid => {
            if (bid.bidder.toLowerCase() === account.toLowerCase()) {
                setUserBid(bid);
            }
        });
    }, [account, bids])

    if (!bids || bids.length === 0) {
        return <div className="p-4 text-gray-600">No bids yet.</div>;
    }

    return (

        <div className="p-4 text-white rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-semibold mb-4">Bids</h2>

            <div className="space-y-4">
                {userBid && (
                    <BidCard
                        bid={userBid}
                        jobClient={jobClient}
                        selectFreelancer={selectFreelancer}
                        loading={loading}
                        status={status}
                        handleWithdraw={handleWithdraw}
                    />
                )}

                {bids
                    .filter(bid => bid.bidder.toLowerCase() !== account.toLowerCase())
                    .map((bid, index) => (
                        <BidCard
                            key={index}
                            bid={bid}
                            jobClient={jobClient}
                            selectFreelancer={selectFreelancer}
                            loading={loading}
                            status={status}
                            handleWithdraw={handleWithdraw}
                        />
                    ))}
            </div>

        </div>

    );
};

export default BidList;
