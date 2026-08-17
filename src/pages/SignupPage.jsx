import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLES, RolesList } from "../data/users.jsx";
import { useAuth } from "../components/AuthContext.jsx";

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(ROLES.GUEST);
  const [error, setError] = useState("");
  const { signup } = useAuth();

  const handleSignup = (username, password, role) => {
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const result = signup(username, password, role); // updates context and localStorage
    if (!result.success) {
      setError(result.error);
      return;
    } else {
      setError("Signup successful! Please login.");
    }
  };

  return (
    <>
      <h1>Signup Page</h1>
      <div className="form-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSignup(
              formData.get("username"),
              formData.get("password"),
              role,
            );
          }}
        >
          <label htmlFor="username">Username:</label>
          <input id="username" name="username" required type="text" />
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" required type="password" />
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" disabled>
              Roles
            </option>
            {RolesList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button type="submit">Signup</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
      <button type="submit" onClick={() => navigate("/")}>
        Login
      </button>
    </>
  );
}

export default SignupPage;
