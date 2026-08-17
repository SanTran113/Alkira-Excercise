import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../components/AuthContext";

/**
 * Renders `ui` inside a fresh AuthProvider + MemoryRouter.
 * Each test gets an isolated auth state (localStorage is cleared in setup.js).
 */
export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthProvider>,
  );
}
