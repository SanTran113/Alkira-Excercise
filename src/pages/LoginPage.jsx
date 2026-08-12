import { useNavigate } from "react-router-dom";
import usersList from "../data/users.jsx";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (username, password) => {
    if (!username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const user = usersList.find((user) => user.username === username);

    if (!user) {
      alert("Invalid username or password.");
      return;
    }

    if (user.password !== password) {
      alert("Invalid username or password.");
      return;
    }

    // Login successful
    alert("Login successful!");
    navigate("/main");
  };

  return (
    <div className="login-container">
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
      <button type="submit" onClick={() => (window.location.hash = "/signup")}>
        Signup
      </button>
      {/* <App user={username} /> */}
    </div>
  );
}

export default LoginPage;
