import { Link } from 'react-router-dom'

function Success() {
  return (
    <div className="result-box success">
      <h1>Payment Successful!</h1>
      <p>Thank you for your order. You will receive a confirmation email shortly.</p>
      <Link to="/" className="btn-primary">Back to shop</Link>
    </div>
  )
}

export default Success
