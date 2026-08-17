import { createContext, useContext, useState } from "react";
import staticUsersList from "../data/users.jsx";
import { sendOTP, verifyOTP } from "../services/mfaService.jsx";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("loggedIn");
    return stored ? JSON.parse(stored) : null;
  });
  const [pendingUser, setPendingUser] = useState(null);
  const [otp, setOtp] = useState(null);
  const [usersList, setUsersList] = useState(() => {
    const storedSignedUpUsers = JSON.parse(
      localStorage.getItem("signedUpUsers") || "[]",
    );
    return [...staticUsersList, ...storedSignedUpUsers];
  });

  console.log("usersList", usersList);
  console.log("pending", pendingUser);
  console.log("otp", otp);

  // checks the user is able to login based on the credientials.
  const login = (username, password) => {
    const findUser = usersList.find((u) => u.username === username);

    if (!findUser) {
      return { success: false, error: "Invalid username." };
    }

    if (findUser.password !== password) {
      return { success: false, error: "Invalid password." };
    }

    const { password: pw, ...safeUser } = findUser;

    setPendingUser(safeUser);
    return { success: true };
  };

  const requestMfaCode = async () => {
    if (!pendingUser) {
      return { success: false, error: "No pending login." };
    }

    const { code, expiresAt } = await sendOTP(pendingUser.username);
    setOtp({ code, expiresAt });
    return { success: true, code: code };
  };

  const verifyMfaCode = (inputCode) => {
    if (!otp || !pendingUser) {
      return { success: false, error: "Code could not be generated." };
    }

    const result = verifyOTP(inputCode, otp.code, otp.expiresAt);
    if (!result.success) {
      return result;
    }

    setUser(pendingUser);
    localStorage.setItem("loggedIn", JSON.stringify(pendingUser));
    setPendingUser(null);
    setOtp(null);
    return { success: true };
  };

  const cancelMfa = () => {
    setPendingUser(null);
    setOtp(null);
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
    <AuthContext.Provider
      value={{
        user,
        pendingUser,
        usersList,
        login,
        signup,
        logout,
        requestMfaCode,
        verifyMfaCode,
        cancelMfa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
