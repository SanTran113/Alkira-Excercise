import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = (username, password) => {
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const result = login(username, password); // updates context and localStorage
    if (!result.success) {
      setError(result.error);
      return;
    }

    setError("");
    navigate("/mfa");
  };

  return (
    <>
      <h1>Login Page</h1>
      <div className="form-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleLogin(formData.get("username"), formData.get("password"));
          }}
        >
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" required />
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
          <button type="submit">Login</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
      <button type="button" onClick={() => navigate("/signup")}>
        Signup
      </button>
    </>
  );
}

export default LoginPage;