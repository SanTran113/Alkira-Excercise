import { useAuth } from "./AuthContext";
import LoginPage from "../pages/LoginPage";

function ProtectedRoute({children}) {
    const {user} = useAuth();

    if (!user) {
        return <LoginPage />;
    }

    return children;
}

export default ProtectedRoute;