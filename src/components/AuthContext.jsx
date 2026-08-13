import { createContext, useContext, useState } from "react";
import staticUsersList from "../data/users.jsx";

const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(() => localStorage.getItem('loggedIn') || null);
    const [usersList, setUsersList] = useState(staticUsersList);

    console.log("usersList", usersList);

    /**
     * checks the user is able to login based on the credientials.
     * @param {*} username 
     * @returns true or false if successful
     */
    const login = (username, password) => {
        const findUser = usersList.find((u) => u.username === username);

        if (!findUser) {
        alert("Invalid username.");
        return;
        }

        if (findUser.password !== password) {
        alert("Invalid password.");
        return;
        }


        localStorage.setItem("loggedIn", username);
        setUser(username);
    }

    const signup = (username, password, role) => {
        const newUser = { username, password, role };
        const newUserList = [...staticUsersList, newUser];
        setUsersList(newUserList);

        const findSignedUpUsers = newUserList.filter(
            (u) => !staticUsersList.some((su) => su.username === u.username)
        );
        localStorage.setItem("signedUpUsers", JSON.stringify(findSignedUpUsers));
    }

    const logout = () => {
        localStorage.removeItem("loggedIn");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, usersList, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}