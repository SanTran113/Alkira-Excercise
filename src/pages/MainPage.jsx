import { useState } from "react";
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
  const [connections, setConnections] = useState(mockConnections);
  const [isEditing, setIsEditing] = useState(false); // global: are we in "edit mode" at all
  const [drafts, setDrafts] = useState({}); // id -> draft object, only for rows still being edited

  const isAdmin = user?.role === ROLES.ADMIN;

  const startEditing = () => {
    const initalConnections = Object.fromEntries(
      connections.map((c) => [c.id, { ...c }])
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
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? drafts[id] : c))
    );
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
                      onChange={(e) => updateDraft(c.id, "name", e.target.value)}
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td>
                  {rowInEdit ? (
                    <select
                      value={d.type}
                      onChange={(e) => updateDraft(c.id, "type", e.target.value)}
                    >
                      {ConnectionTypesList.map((t) => (
                        <option key={t} value={t}>{t}</option>
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
                      onChange={(e) => updateDraft(c.id, "status", e.target.value)}
                    >
                      {ConnectionStatusesList.map((s) => (
                        <option key={s} value={s}>{s}</option>
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
                      onChange={(e) => updateDraft(c.id, "region", e.target.value)}
                    >
                      {RegionsList.map((r) => (
                        <option key={r} value={r}>{r}</option>
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
                      onChange={(e) => updateDraft(c.id, "enabled", e.target.checked)}
                    />
                  ) : (
                    String(c.enabled)
                  )}
                </td>
                {isAdmin && (
                  <td>
                    {rowInEdit ? (
                      <>
                        <button onClick={() => handleSaveRow(c.id)}>Save</button>
                        <button onClick={() => handleCancelRow(c.id)}>Cancel</button>
                      </>
                    ) : (
                      isEditing && <span>
                        <button onClick={() => handleEditAgain(c.id)}>Edit</button>
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <button onClick={() => { logout(); navigate("/"); }}>logout</button>

      {isAdmin && !isEditing && (
        <button onClick={startEditing}>Edit</button>
      )}
      {isAdmin && isEditing && (
        <button onClick={() => { setIsEditing(false); setDrafts({}); }}>
          Done
        </button>
      )}
    </div>
  );
}

export default MainPage;