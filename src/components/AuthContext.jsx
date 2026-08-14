import { createContext, useContext, useState } from "react";
import staticUsersList from "../data/users.jsx";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => localStorage.getItem("loggedIn") || null,
  );
  const [usersList, setUsersList] = useState(() => {
    const storedSignedUpUsers = JSON.parse(
      localStorage.getItem("signedUpUsers") || "[]",
    );
    return [...staticUsersList, ...storedSignedUpUsers];
  });

  console.log("usersList", usersList);

  /**
   * checks the user is able to login based on the credientials.
   * @param {*} username, password
   * @returns true or false if successful
   */
  const login = (username, password) => {
    const findUser = usersList.find((u) => u.username === username);

    if (!findUser) {
      return { success: false, error: "Invalid username." };
    }

    if (findUser.password !== password) {
      return { success: false, error: "Invalid password." };
    }

    const { password: pw, ...safeUser } = findUser;

    localStorage.setItem("loggedIn", JSON.stringify(safeUser));
    setUser(safeUser);
    return { success: true };
  };

  const signup = (username, password, role) => {
    const findUser = usersList.find((u) => u.username === username);

    if (findUser) {
      return { success: false, error: "Username already exists." };
    }

    const newUser = { username, password, role };
    const newUserList = [...usersList, newUser];
    setUsersList(newUserList);

    const findSignedUpUsers = newUserList.filter(
      (u) => !staticUsersList.some((su) => su.username === u.username),
    );
    localStorage.setItem("signedUpUsers", JSON.stringify(findSignedUpUsers));
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("loggedIn");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, usersList, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
