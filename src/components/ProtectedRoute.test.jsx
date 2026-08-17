import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/testUtils";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("./AuthContext.jsx", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useAuth: vi.fn(actual.useAuth) };
});

import { useAuth } from "./AuthContext.jsx";
const realUseAuth = useAuth.getMockImplementation();

beforeEach(() => {
  useAuth.mockImplementation(realUseAuth);
});

describe("ProtectedRoute", () => {
  it("renders LoginPage when there is no authenticated user", () => {
    useAuth.mockReturnValue({ user: null });
    renderWithProviders(
      <ProtectedRoute>
        <div>PROTECTED_CONTENT</div>
      </ProtectedRoute>,
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.queryByText("PROTECTED_CONTENT")).not.toBeInTheDocument();
  });

  it("renders children when a user is authenticated", () => {
    useAuth.mockReturnValue({ user: { username: "testUser", role: "Admin" } });
    renderWithProviders(
      <ProtectedRoute>
        <div>PROTECTED_CONTENT</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("PROTECTED_CONTENT")).toBeInTheDocument();
  });
});