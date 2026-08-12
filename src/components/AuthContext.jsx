import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(() => localStorage.getItem('loggedIn') || null);

    const login = (username) => {
        localStorage.setItem("loggedIn", username);
        setUser(username);
    }

    const logout = () => {
        localStorage.removeItem("loggedIn");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}