import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (username, password) => {
    if (!username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const result = login(username, password); // updates context and localStorage
    if (!result.success) {
      alert(result.error);
      return;
    } else {
      navigate("/main");
    }
    
  };

  return (
    <>
      <h1>Login Page</h1>
      <div className="form-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin(e.target.username.value, e.target.password.value);
          }}
        >
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" required />
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
          <button type="submit">Login</button>
        </form>
      </div>
      <button type="submit" onClick={() => (window.location.hash = "/signup")}>
        Signup
      </button>
    </>
  );
}

export default LoginPage;
