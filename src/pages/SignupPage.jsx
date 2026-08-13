import { useState } from "react";
import users from "../data/users.jsx";
import { Roles, RolesList } from "../data/users.jsx";

function SignupPage() {
    const [usersList, setUsersList] = useState(users);
    const [role, setRole] = useState(Roles.GUEST);

    const handleSignup = (username, password, role) => {
        // check if user alr exists
        const userExists = usersList.some((user) => user.username === username);

        if (!username || !password) {
        alert("Please fill in all fields.");
        return;
        }

        if (userExists) {
        alert("Username already exists.");
        return;
        }

        setUsersList([...usersList, { username, password, role }]);
    };

    return (
        <>
        <h1>Signup Page</h1>
        <form
            onSubmit={(e) => {
            e.preventDefault();
            handleSignup(e.target.username.value, e.target.password.value, role);
            }}
        >
            <label>Username:</label>
            <input type="text" name="username" required />
            <label>Password:</label>
            <input type="password" name="password" required />
            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="cate" disabled>
                Roles
            </option>
            {RolesList.map((r) => (
                <option key={r} value={r}>
                {r}
                </option>
            ))}
            </select>
            <button type="submit">Signup</button>
        </form>
        <button type="submit" onClick={() => (window.location.hash = "/")}>
            Login
        </button>
        </>
    );
    }

    export default SignupPage;
