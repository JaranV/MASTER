//source: https://kinsta.com/blog/stripe-java-api/

import NavButtons from "./routes/NavButtons.tsx"
import Checkout from "./routes/Checkout.tsx"
import NewSubscription from "./routes/NewSubscription.tsx"
import CancelSubscription from "./routes/CancelSubscription.tsx"
import Success from "./routes/Success.tsx"
import Failure from "./routes/Failure.tsx"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

function App() {
  const router = createBrowserRouter([
    {
      element: <NavButtons />,
      children: [
        { path: "/",         element: <h1>Webshop</h1> },
        { path: "/checkout", element: <Checkout /> },
        { path: "/success",  element: <Success /> },
        { path: "/failure",  element: <Failure /> },
        { path: "/subscription",          element: <NewSubscription /> },
        { path: "/cancel-subscription",  element: <CancelSubscription /> },
      ]
    },
  ]);
  return (
    <RouterProvider router={router}/>
  )
}

export default App












//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
//import heroImg from './assets/hero.png'
//import './App.css'
//
//function App() {
//  const [count, setCount] = useState(0)
//
//  return (
//    <>
//      <section id="center">
//        <div className="hero">
//          <img src={heroImg} className="base" width="170" height="179" alt="" />
//          <img src={reactLogo} className="framework" alt="React logo" />
//          <img src={viteLogo} className="vite" alt="Vite logo" />
//        </div>
//        <div>
//          <h1>Get started</h1>
//          <p>
//            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
//          </p>
//        </div>
//        <button
//          className="counter"
//          onClick={() => setCount((count) => count + 1)}
//        >
//          Count is {count}
//        </button>
//      </section>
//
//      <div className="ticks"></div>
//
//      <section id="next-steps">
//        <div id="docs">
//          <svg className="icon" role="presentation" aria-hidden="true">
//            <use href="/icons.svg#documentation-icon"></use>
//          </svg>
//          <h2>Documentation</h2>
//          <p>Your questions, answered</p>
//          <ul>
//            <li>
//              <a href="https://vite.dev/" target="_blank">
//                <img className="logo" src={viteLogo} alt="" />
//                Explore Vite
//              </a>
//            </li>
//            <li>
//              <a href="https://react.dev/" target="_blank">
//                <img className="button-icon" src={reactLogo} alt="" />
//                Learn more
//              </a>
//            </li>
//          </ul>
//        </div>
//        <div id="social">
//          <svg className="icon" role="presentation" aria-hidden="true">
//            <use href="/icons.svg#social-icon"></use>
//          </svg>
//          <h2>Connect with us</h2>
//          <p>Join the Vite community</p>
//          <ul>
//            <li>
//              <a href="https://github.com/vitejs/vite" target="_blank">
//                <svg
//                  className="button-icon"
//                  role="presentation"
//                  aria-hidden="true"
//                >
//                  <use href="/icons.svg#github-icon"></use>
//                </svg>
//                GitHub
//              </a>
//            </li>
//            <li>
//              <a href="https://chat.vite.dev/" target="_blank">
//                <svg
//                  className="button-icon"
//                  role="presentation"
//                  aria-hidden="true"
//                >
//                  <use href="/icons.svg#discord-icon"></use>
//                </svg>
//                Discord
//              </a>
//            </li>
//            <li>
//              <a href="https://x.com/vite_js" target="_blank">
//                <svg
//                  className="button-icon"
//                  role="presentation"
//                  aria-hidden="true"
//                >
//                  <use href="/icons.svg#x-icon"></use>
//                </svg>
//                X.com
//              </a>
//            </li>
//            <li>
//              <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                <svg
//                  className="button-icon"
//                  role="presentation"
//                  aria-hidden="true"
//                >
//                  <use href="/icons.svg#bluesky-icon"></use>
//                </svg>
//                Bluesky
//              </a>
//            </li>
//          </ul>
//        </div>
//      </section>
//
//      <div className="ticks"></div>
//      <section id="spacer"></section>
//    </>
//  )
//}
//
//export default App
//