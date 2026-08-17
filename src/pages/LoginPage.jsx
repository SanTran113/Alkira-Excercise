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
      <div className="form-container">
        <h1>Login</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleLogin(formData.get("username"), formData.get("password"));
          }}
        >
          <section>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />
          </section>
          <section>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </section>
          <button type="submit">Login</button>
          {error && <p role="alert">{error}</p>}
          <div className="footer">
            or
            <button className="link" type="button" onClick={() => navigate("/signup")}>
              signup
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default LoginPage;
