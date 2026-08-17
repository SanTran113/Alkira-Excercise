import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "../test/testUtils";
import LoginPage from "./LoginPage";

function renderLoginPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/mfa" element={<div>MFA_PAGE</div>} />
      <Route path="/signup" element={<div>SIGNUP_PAGE</div>} />
    </Routes>,
  );
}

describe("LoginPage", () => {
  it("renders username and password fields", () => {
    renderLoginPage();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows a validation error when submitted with empty fields", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    // Fields are HTML `required`, so bypass native validation to exercise
    // the app's own validation branch.
    const form = screen.getByRole("button", { name: /login/i }).closest("form");
    form.noValidate = true;

    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/please fill in all fields/i),
    ).toBeInTheDocument();
  });

  it("shows an error for an unknown username", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/username/i), "unknnown");
    await user.type(screen.getByLabelText(/password/i), "unknown");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid username/i)).toBeInTheDocument();
  });

  it("shows an error for a valid username with the wrong password", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/username/i), "1");
    await user.type(screen.getByLabelText(/password/i), "wrongPassword");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid password/i)).toBeInTheDocument();
  });

  it("navigates to the MFA step on valid credentials", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/username/i), "1");
    await user.type(screen.getByLabelText(/password/i), "1");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("MFA_PAGE")).toBeInTheDocument();
  });

  it("navigates to the signup screen", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: /signup/i }));

    expect(await screen.findByText("SIGNUP_PAGE")).toBeInTheDocument();
  });
});
