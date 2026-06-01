import {useNavigate} from "react-router-dom";

function Success() {
    const queryParams = new URLSearchParams(window.location.search)
    const navigate = useNavigate()
    const onButtonClick = () => {
        navigate("/")
    }
    return (
        <div>
            <h1>Success!</h1>
            <p>{queryParams.toString().split("&").join("\n")}</p>
            <button onClick={onButtonClick}>Go Home</button>
        </div>
    )
}

export default Success