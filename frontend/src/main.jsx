import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './components/Home.jsx'
import { ChainContextProvider } from './context/ChainContextProvider.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router'
import About from './components/About.jsx'
import Header from './components/Header.jsx'
import Layout from './components/Layout.jsx'
import Profile from './components/Profile.jsx'
import Custom from './components/Custom.jsx'
import JobPost from './components/JobPost.jsx'

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
