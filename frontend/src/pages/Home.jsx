import { useContext } from "react";
import { ChainContext } from "../context/ChainContextProvider";
import CreateJobForm from "../components/CreateJobForm";
import JobsList from "../components/JobList";
import ConnectWallet from "../components/ConnectWallet";

function Home() {

  const { account } = useContext(ChainContext)

  return (
    <div className=" min-h-screen bg-gray-950 flex pb-16">
      <div className={`w-full relative top-14 border-2 border-red-600 flex `}>
        {
          account ?
            <JobsList jobStatus="Open" />
            :
            <ConnectWallet />
        }
      </div>
    </div>
  )
}

export default Home;

