import NavButtons from "./routes/NavButtons.tsx"
import Products from "./routes/Products.tsx"
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
        { path: "/products", element: <Products /> },
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
