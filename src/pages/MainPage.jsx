import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";
import { ROLES } from "../data/users.jsx";
import {
  mockConnections,
  ConnectionTypesList,
  ConnectionStatusesList,
  RegionsList,
} from "../data/networkConnections.jsx";

function MainPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [connections, setConnections] = useState(() => {
    const saved = localStorage.getItem("connections");
    return saved ? JSON.parse(saved) : mockConnections;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [drafts, setDrafts] = useState({});

  const isAdmin = user?.role === ROLES.ADMIN;

  useEffect(() => {
    localStorage.setItem("connections", JSON.stringify(connections));
  }, [connections]);

  const startEditing = () => {
    const initalConnections = Object.fromEntries(
      connections.map((c) => [c.id, { ...c }]),
    );
    setDrafts(initalConnections);
    setIsEditing(true);
  };

  const updateDraft = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveRow = (id) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? drafts[id] : c)));
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const cancelRow = (id) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSaveRow = (id) => {
    saveRow(id);
  };

  const handleCancelRow = (id) => {
    cancelRow(id);
  };

  const handleEditAgain = (id) => {
    const original = connections.find((c) => c.id === id);
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...original },
    }));
  };

  return (
    <div className="form-container">
      <h1>Network Connections</h1>
      <table>
        <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
            <th scope="col">Region</th>
            <th scope="col">Enabled</th>
            {isEditing && <th scope="col">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {connections.map((c) => {
            const rowInEdit = isEditing && drafts[c.id] !== undefined;
            const d = drafts[c.id];
            return (
              <tr key={c.id}>
                <th scope="row">{c.id}</th>
                <td>
                  {rowInEdit ? (
                    <input
                      value={d.name}
                      onChange={(e) =>
                        updateDraft(c.id, "name", e.target.value)
                      }
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td>
                  {rowInEdit ? (
                    <select
                      value={d.type}
                      onChange={(e) =>
                        updateDraft(c.id, "type", e.target.value)
                      }
                    >
                      {ConnectionTypesList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    c.type
                  )}
                </td>
                <td>
                  {rowInEdit ? (
                    <select
                      value={d.status}
                      onChange={(e) =>
                        updateDraft(c.id, "status", e.target.value)
                      }
                    >
                      {ConnectionStatusesList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    c.status
                  )}
                </td>
                <td>
                  {rowInEdit ? (
                    <select
                      value={d.region}
                      onChange={(e) =>
                        updateDraft(c.id, "region", e.target.value)
                      }
                    >
                      {RegionsList.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    c.region
                  )}
                </td>
                <td>
                  {rowInEdit ? (
                    <input
                      type="checkbox"
                      checked={d.enabled}
                      onChange={(e) =>
                        updateDraft(c.id, "enabled", e.target.checked)
                      }
                    />
                  ) : (
                    String(c.enabled)
                  )}
                </td>
                {isAdmin && (
                  <>
                    {rowInEdit ? (
                      <td>
                        <button onClick={() => handleSaveRow(c.id)}>
                          Save
                        </button>
                        <button onClick={() => handleCancelRow(c.id)}>
                          Cancel
                        </button>
                      </td>
                    ) : (
                      isEditing && (
                        <td>
                          <button onClick={() => handleEditAgain(c.id)}>
                            Edit
                          </button>
                        </td>
                      )
                    )}
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="actions">
        {isAdmin && !isEditing && <button onClick={startEditing}>Edit</button>}
        {isAdmin && isEditing && (
          <button
            onClick={() => {
              setIsEditing(false);
              setDrafts({});
            }}
          >
            Done
          </button>
        )}
        <button
          className="secondary-button"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          logout
        </button>
      </div>
    </div>
  );
}

export default MainPage;
