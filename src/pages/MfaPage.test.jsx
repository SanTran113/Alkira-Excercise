import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "../test/testUtils";
import LoginPage from "./LoginPage";
import MfaPage from "./MfaPage";

// Mock useAuth, but default it to the REAL implementation so the one
// integration test below can still exercise actual AuthContext logic.
// Individual tests override it with mockReturnValue for isolated behavior.
vi.mock("../components/AuthContext.jsx", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useAuth: vi.fn(actual.useAuth) };
});

import { useAuth } from "../components/AuthContext.jsx";
const realUseAuth = useAuth.getMockImplementation();

beforeEach(() => {
  useAuth.mockImplementation(realUseAuth);
});

function renderAtMfa() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<div>LOGIN_PAGE</div>} />
      <Route path="/mfa" element={<MfaPage />} />
      <Route path="/main" element={<div>MAIN_PAGE</div>} />
    </Routes>,
    { route: "/mfa" },
  );
}

function mockAuth(overrides = {}) {
  useAuth.mockReturnValue({
    user: null,
    pendingUser: { username: "newUser", role: "Guest" },
    requestMfaCode: vi.fn().mockResolvedValue({ code: "123456" }),
    verifyMfaCode: vi.fn(),
    cancelMfa: vi.fn(),
    ...overrides,
  });
}

describe("MfaPage (mocked useAuth)", () => {
  it("requests a code on mount and renders the form", async () => {
    const requestMfaCode = vi.fn().mockResolvedValue({ code: "123456" });
    mockAuth({ requestMfaCode });
    renderAtMfa();

    expect(requestMfaCode).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/input code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^verify$/i })).toBeInTheDocument();
    expect(await screen.findByText("123456")).toBeInTheDocument();
  });

  it("shows a validation error when submitted with an empty code", async () => {
    const verifyMfaCode = vi.fn();
    mockAuth({ verifyMfaCode });
    const user = userEvent.setup();
    renderAtMfa();

    const form = screen.getByRole("button", { name: /^verify$/i }).closest("form");
    form.noValidate = true;

    await user.click(screen.getByRole("button", { name: /^verify$/i }));

    expect(await screen.findByText(/please enter the code/i)).toBeInTheDocument();
    expect(verifyMfaCode).not.toHaveBeenCalled();
  });

  it("shows an error for an incorrect code", async () => {
    const verifyMfaCode = vi.fn().mockReturnValue({
      success: false,
      error: "Invalid code.",
    });
    mockAuth({ verifyMfaCode });
    const user = userEvent.setup();
    renderAtMfa();

    await user.type(screen.getByLabelText(/input code/i), "000000");
    await user.click(screen.getByRole("button", { name: /^verify$/i }));

    expect(await screen.findByText(/invalid code/i)).toBeInTheDocument();
    expect(verifyMfaCode).toHaveBeenCalledWith("000000");
  });

  it("navigates to the main page on a correct code", async () => {
    const verifyMfaCode = vi.fn().mockReturnValue({ success: true });
    mockAuth({ verifyMfaCode });
    const user = userEvent.setup();
    renderAtMfa();

    await user.type(screen.getByLabelText(/input code/i), "123456");
    await user.click(screen.getByRole("button", { name: /^verify$/i }));

    expect(await screen.findByText("MAIN_PAGE")).toBeInTheDocument();
  });

  it("requests a new code when Resend Code is clicked", async () => {
    const requestMfaCode = vi.fn().mockResolvedValue({ code: "123456" });
    mockAuth({ requestMfaCode });
    const user = userEvent.setup();
    renderAtMfa();

    await waitFor(() => expect(requestMfaCode).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: /resend code/i }));

    await waitFor(() => expect(requestMfaCode).toHaveBeenCalledTimes(2));
  });

  it("cancels MFA and navigates back to the login screen", async () => {
    const cancelMfa = vi.fn();
    mockAuth({ cancelMfa });
    const user = userEvent.setup();
    renderAtMfa();

    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(cancelMfa).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("LOGIN_PAGE")).toBeInTheDocument();
  });
});

describe("MfaPage (real AuthContext, end to end)", () => {
  function renderFullFlow() {
    return renderWithProviders(
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/mfa" element={<MfaPage />} />
        <Route path="/main" element={<div>MAIN_PAGE</div>} />
      </Routes>,
      { route: "/" },
    );
  }

  it("logs in, verifies the real generated code, and reaches the main page", async () => {
    const user = userEvent.setup();
    renderFullFlow();

    await user.type(screen.getByLabelText(/username/i), "1");
    await user.type(screen.getByLabelText(/password/i), "1");
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(await screen.findByText(/MFA Page/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(document.querySelector("#code")).toBeInTheDocument();
    });
    const displayedCode = document.querySelector("#code").textContent;

    await user.type(screen.getByLabelText(/input code/i), displayedCode);
    await user.click(screen.getByRole("button", { name: /^verify$/i }));

    expect(await screen.findByText("MAIN_PAGE")).toBeInTheDocument();
  });
});