import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ChainContextProvider } from './context/ChainContextProvider.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Layout from './pages/Layout.jsx'
import Profile from './pages/Profile.jsx'
import Custom from './components/Custom.jsx'
import JobPost from './pages/JobPost.jsx'
import JobPage from './pages/JobPage.jsx'
import EditProfile from './pages/EditProfile.jsx'
import AuthCheck from './pages/AuthCheck.jsx'
import BidderProfile from './pages/BidderProfile.jsx'
import AdminPanel from './pages/AdminPanel.jsx'

const router = createBrowserRouter([
  {
    //If want to add components in the Layout add children here
    path: '/',
    element: <AuthCheck />,
    children: [
      {
        path: '',
        element: <Home exact />
      },
      {
        path: 'about',
        element: <About />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'createJob',
        element: <JobPost />
      },
      {
        path: 'job/:jobId',
        element: <JobPage />
      },
      {
        path: 'edit-profile',
        element: <EditProfile />
      },
      {
        path: 'bidder/:bidderAddress',
        element: <BidderProfile />
      },
      {
        path: '/admin',
        element: <AdminPanel />
      }
    ]
  },

  //If want to use components without Layout add children here
  {
    path: '/custom',
    element: <Custom />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
