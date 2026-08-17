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
      <div className="form-container">
        <h1>Signup</h1>
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
          <section>
            <label htmlFor="username">Username</label>
            <input id="username" name="username" required type="text" />
          </section>
          <section>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" required type="password" />
          </section>
          <label htmlFor="role">Role</label>
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
          <div className="footer">
            or
            <a type="button" onClick={() => navigate("/")}>
              login
            </a>
          </div>
        </form>
      </div>
    </>
  );
}

export default SignupPage;
