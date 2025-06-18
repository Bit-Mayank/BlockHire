import { useContext } from "react";
import { ChainContext } from "../context/ChainContextProvider";
import CreateJobForm from "./CreateJobForm";
import JobsList from "./JobList";

function Home() {


  return (
    <div className=" min-h-screen bg-gray-700 flex pb-16">
      <div className={`relative top-14 border-2 border-red-600 flex `}>
        <JobsList />
      </div>
    </div>
  )
}

export default Home;

