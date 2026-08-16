import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";
import { ROLES } from "../data/users.jsx";
import { mockConnections } from "../data/networkConnections.jsx";

function MainPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth(); 

  console.log("user", user?.role);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleEdit = () => {
    console.log("edit");
  };

  return (
    <div>
      <h1>Main Page</h1>
      <table>
        <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
            <th scope="col">Region</th>
            <th scope="col">Enabled</th>
          </tr>
        </thead>
        <tbody>
          {mockConnections.map((c) => (
            <tr>
              <th scope="row"> {c.id}</th>
              <td>{c.name}</td>
              <td>{c.type}</td>
              <td>{c.status}</td>
              <td>{c.region}</td>
              <td>{String(c.enabled)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => handleLogout()}>logout</button>
      {user?.role === ROLES.ADMIN && (
        <button onClick={() => handleEdit()}>Edit</button>
      )}
    </div>
  );
}

export default MainPage;
