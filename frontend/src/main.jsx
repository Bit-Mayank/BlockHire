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

const router = createBrowserRouter([
  {
    //If want to add components in the Layout add children here
    path: '/',
    element: <Layout />,
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
    <ChainContextProvider>
      <RouterProvider router={router} />
    </ChainContextProvider>
  </StrictMode>,
)
