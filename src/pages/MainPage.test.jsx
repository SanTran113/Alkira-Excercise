import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "../test/testUtils";
import MainPage from "./MainPage";
import { ROLES } from "../data/users.jsx";
import { mockConnections } from "../data/networkConnections.jsx";

// Mock useAuth, defaulted to the REAL implementation. Individual tests
// override it with mockReturnValue to control the logged-in user/role.
vi.mock("../components/AuthContext.jsx", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useAuth: vi.fn(actual.useAuth) };
});

import { useAuth } from "../components/AuthContext.jsx";
const realUseAuth = useAuth.getMockImplementation();

const mockLogout = vi.fn();

function mockAuth(overrides = {}) {
  useAuth.mockReturnValue({
    logout: mockLogout,
    user: null,
    ...overrides,
  });
}

function mockUser(role) {
  mockAuth({ user: { username: "testUser", role } });
}

function renderMainPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<div>LOGIN_PAGE</div>} />
      <Route path="/main" element={<MainPage />} />
    </Routes>,
    { route: "/main" },
  );
}

beforeEach(() => {
  useAuth.mockImplementation(realUseAuth);
  localStorage.clear();
  mockLogout.mockClear();
});

describe("MainPage", () => {
  it("renders a row for each connection with its details", () => {
    mockUser(ROLES.VIEWER);
    renderMainPage();

    mockConnections.forEach((c) => {
      expect(screen.getByText(c.id)).toBeInTheDocument();
      expect(screen.getByText(c.name)).toBeInTheDocument();
    });
  });

  it("does not show the Edit button for non-admin users", () => {
    mockUser(ROLES.VIEWER);
    renderMainPage();

    expect(
      screen.queryByRole("button", { name: /^edit$/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the Edit button for admin users", () => {
    mockUser(ROLES.ADMIN);
    renderMainPage();

    expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
  });

  it("enters edit mode and shows Save/Cancel controls for each row", async () => {
    const user = userEvent.setup();
    mockUser(ROLES.ADMIN);
    renderMainPage();

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    expect(screen.getAllByRole("button", { name: /^save$/i }).length).toBe(
      mockConnections.length,
    );
    expect(screen.getAllByRole("button", { name: /^cancel$/i }).length).toBe(
      mockConnections.length,
    );
    expect(screen.getByRole("button", { name: /^done$/i })).toBeInTheDocument();
  });

  it("updates a row's name and persists it after saving", async () => {
    const user = userEvent.setup();
    mockUser(ROLES.ADMIN);
    renderMainPage();

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    const firstConn = mockConnections[0];
    const nameInput = screen.getByDisplayValue(firstConn.name);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Connection Name");

    const saveButtons = screen.getAllByRole("button", { name: /^save$/i });
    await user.click(saveButtons[0]);

    expect(screen.getByText("Updated Connection Name")).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem("connections"));
    expect(stored[0].name).toBe("Updated Connection Name");
  });

  it("discards changes to a row when Cancel is clicked", async () => {
    const user = userEvent.setup();
    mockUser(ROLES.ADMIN);
    renderMainPage();

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    const firstConn = mockConnections[0];
    const nameInput = screen.getByDisplayValue(firstConn.name);
    await user.clear(nameInput);
    await user.type(nameInput, "Should Not Persist");

    const cancelButtons = screen.getAllByRole("button", { name: /^cancel$/i });
    await user.click(cancelButtons[0]);

    expect(screen.queryByText("Should Not Persist")).not.toBeInTheDocument();
    expect(screen.getByText(firstConn.name)).toBeInTheDocument();
  });

  it("allows re-editing a row after it has been saved and returns to view mode", async () => {
    const user = userEvent.setup();
    mockUser(ROLES.ADMIN);
    renderMainPage();

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    const saveButtons = screen.getAllByRole("button", { name: /^save$/i });
    await user.click(saveButtons[0]);

    const editButtons = screen.getAllByRole("button", { name: /^edit$/i });
    expect(editButtons.length).toBeGreaterThan(0);

    await user.click(editButtons[0]);

    expect(
      screen.getAllByRole("button", { name: /^save$/i }).length,
    ).toBeGreaterThan(0);
  });

  it("exits edit mode when Done is clicked", async () => {
    const user = userEvent.setup();
    mockUser(ROLES.ADMIN);
    renderMainPage();

    await user.click(screen.getByRole("button", { name: /^edit$/i }));
    await user.click(screen.getByRole("button", { name: /^done$/i }));

    expect(
      screen.queryByRole("button", { name: /^save$/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
  });

  it("calls logout and navigates back to the login screen", async () => {
    const user = userEvent.setup();
    mockUser(ROLES.VIEWER);
    renderMainPage();

    await user.click(screen.getByRole("button", { name: /^logout$/i }));

    expect(mockLogout).toHaveBeenCalled();
    expect(await screen.findByText("LOGIN_PAGE")).toBeInTheDocument();
  });

  it("toggles a row's enabled checkbox and persists it after saving", async () => {
    const user = userEvent.setup();
    mockUser(ROLES.ADMIN);
    renderMainPage();

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    const firstConn = mockConnections[0];
    const nameInput = screen.getByDisplayValue(firstConn.name);
    const row = nameInput.closest("tr");
    const checkbox = within(row).getByRole("checkbox");

    expect(checkbox.checked).toBe(firstConn.enabled);

    await user.click(checkbox);

    const saveButtons = screen.getAllByRole("button", { name: /^save$/i });
    await user.click(saveButtons[0]);

    expect(screen.getByText(String(!firstConn.enabled))).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem("connections"));
    expect(stored[0].enabled).toBe(!firstConn.enabled);
  });
});
