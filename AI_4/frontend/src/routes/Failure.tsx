import { Link } from 'react-router-dom'

function Failure() {
  return (
    <div className="result-box failure">
      <h1>Payment Failed</h1>
      <p>Something went wrong with your payment. Please try again.</p>
      <Link to="/cart" className="btn-primary">Back to cart</Link>
    </div>
  )
}

export default Failure
