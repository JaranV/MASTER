import {useNavigate} from "react-router-dom";

function Failure() {
    const queryParams = new URLSearchParams(window.location.search)
    const navigate = useNavigate()
    const onButtonClick = () => {
        navigate("/")
    }
    return (
        <div>
            <h1>Failure!</h1>
            <p>{queryParams.toString().split("&").join("\n")}</p>
            <button onClick={onButtonClick}>Try Again</button>
        </div>
    )
}

export default Failure