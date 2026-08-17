import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "../test/testUtils";
import SignupPage from "./SignupPage";

function renderSignupPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<div>LOGIN_PAGE</div>} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>,
    { route: "/signup" },
  );
}

describe("SignupPage", () => {
  it("renders username, password, and role fields", () => {
    renderSignupPage();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });

  it("shows a validation error when submitted with empty fields", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const form = screen
      .getByRole("button", { name: /^signup$/i })
      .closest("form");
    form.noValidate = true;

    await user.click(screen.getByRole("button", { name: /^signup$/i }));

    expect(
      await screen.findByText(/please fill in all fields/i),
    ).toBeInTheDocument();
  });

  it("rejects a username that already exists", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/username/i), "1");
    await user.type(screen.getByLabelText(/password/i), "password");
    await user.click(screen.getByRole("button", { name: /^signup$/i }));

    expect(
      await screen.findByText(/username already exists/i),
    ).toBeInTheDocument();
  });

  it("creates a new user with the selected role and shows a success message", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/username/i), "newUser");
    await user.type(screen.getByLabelText(/password/i), "newPassword");
    await user.selectOptions(screen.getByLabelText(/role/i), "Admin");
    await user.click(screen.getByRole("button", { name: /^Signup$/i }));

    expect(await screen.findByText(/success/i)).toBeInTheDocument();

    // Persisted so a freshly-created AuthProvider can log in.
    const stored = JSON.parse(localStorage.getItem("signedUpUsers"));
    expect(stored).toEqual([
      { username: "newUser", password: "newPassword", role: "Admin" },
    ]);
  });

  it("navigates back to the login screen", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(await screen.findByText("LOGIN_PAGE")).toBeInTheDocument();
  });
});
