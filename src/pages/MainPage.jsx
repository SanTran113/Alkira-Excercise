import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";
import { ROLES } from "../data/users.jsx";

function MainPage() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    console.log("user", user?.role);

    const handleLogout = () => {
        logout();
        navigate("/");
    }

    const handleEdit = () => {
        console.log("edit");
    }

    return (
        <div>
            Main Page
            <button onClick = {() => handleLogout()}>logout</button>
            {user?.role === ROLES.ADMIN && (
                <button onClick = {() => handleEdit()}>Edit</button>
            )}
        </div>
    )
}

export default MainPage;