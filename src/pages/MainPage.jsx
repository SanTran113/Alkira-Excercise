import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";

function MainPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    }

    return (
        <div>
            Main Page
            <button onClick = {() => handleLogout()}>logout</button>
        </div>
    )
}

export default MainPage;