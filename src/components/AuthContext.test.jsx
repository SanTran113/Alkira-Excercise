import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext.jsx";

vi.mock("../services/mfaService.jsx", () => ({
  sendOTP: vi.fn(),
  verifyOTP: vi.fn(),
}));
import { sendOTP, verifyOTP } from "../services/mfaService.jsx";

function renderAuth() {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("AuthContext", () => {
  describe("login", () => {
    it("fails with an unknown username", () => {
      const { result } = renderAuth();

      let response;
      act(() => {
        response = result.current.login("unknown", "unknown");
      });

      expect(response).toEqual({ success: false, error: "Invalid username." });
      expect(result.current.pendingUser).toBeNull();
    });

    it("fails with a wrong password for a known username", () => {
      const { result } = renderAuth();

      let response;
      act(() => {
        response = result.current.login("1", "wrongPassword");
      });

      expect(response).toEqual({ success: false, error: "Invalid password." });
      expect(result.current.pendingUser).toBeNull();
    });

    it("succeeds and sets pendingUser (without the password) on correct credentials", () => {
      const { result } = renderAuth();

      let response;
      act(() => {
        response = result.current.login("1", "1");
      });

      expect(response).toEqual({ success: true });
      expect(result.current.pendingUser).toMatchObject({ username: "1" });
      expect(result.current.pendingUser).not.toHaveProperty("1");
    });
  });

  describe("requestMfaCode", () => {
    it("fails when there is no pending login", async () => {
      const { result } = renderAuth();

      let response;
      await act(async () => {
        response = await result.current.requestMfaCode();
      });

      expect(response).toEqual({ success: false, error: "No pending login." });
      expect(sendOTP).not.toHaveBeenCalled();
    });

    it("sends an OTP for the pending user and returns the code", async () => {
      sendOTP.mockResolvedValue({ code: "123456", expiresAt: Date.now() + 60000 });
      const { result } = renderAuth();

      act(() => {
        result.current.login("1", "1");
      });

      let response;
      await act(async () => {
        response = await result.current.requestMfaCode();
      });

      expect(sendOTP).toHaveBeenCalledWith("1");
      expect(response).toEqual({ success: true, code: "123456" });
    });
  });

  describe("verifyMfaCode", () => {
    it("fails when no code has been requested yet", () => {
      const { result } = renderAuth();

      act(() => {
        result.current.login("1", "1");
      });

      let response;
      act(() => {
        response = result.current.verifyMfaCode("123456");
      });

      expect(response).toEqual({
        success: false,
        error: "Code could not be generated.",
      });
      expect(verifyOTP).not.toHaveBeenCalled();
    });

    it("fails and returns the service error on an incorrect code", async () => {
      sendOTP.mockResolvedValue({ code: "123456", expiresAt: 999999 });
      verifyOTP.mockReturnValue({ success: false, error: "Invalid code." });
      const { result } = renderAuth();

      act(() => {
        result.current.login("1", "1");
      });
      await act(async () => {
        await result.current.requestMfaCode();
      });

      let response;
      act(() => {
        response = result.current.verifyMfaCode("000000");
      });

      expect(verifyOTP).toHaveBeenCalledWith("000000", "123456", 999999);
      expect(response).toEqual({ success: false, error: "Invalid code." });
      expect(result.current.pendingUser).not.toBeNull();
    });

    it("logs the user in, persists to localStorage, and clears pendingUser/otp on a correct code", async () => {
      sendOTP.mockResolvedValue({ code: "123456", expiresAt: 999999 });
      verifyOTP.mockReturnValue({ success: true });
      const { result } = renderAuth();

      act(() => {
        result.current.login("1", "1");
      });
      await act(async () => {
        await result.current.requestMfaCode();
      });

      let response;
      act(() => {
        response = result.current.verifyMfaCode("123456");
      });

      expect(response).toEqual({ success: true });
      expect(result.current.user).toMatchObject({ username: "1" });
      expect(result.current.pendingUser).toBeNull();
      expect(JSON.parse(localStorage.getItem("loggedIn"))).toMatchObject({
        username: "1",
      });
    });
  });

  describe("cancelMfa", () => {
    it("clears pendingUser without logging the user in", async () => {
      sendOTP.mockResolvedValue({ code: "123456", expiresAt: 999999 });
      const { result } = renderAuth();

      act(() => {
        result.current.login("1", "1");
      });
      await act(async () => {
        await result.current.requestMfaCode();
      });

      act(() => {
        result.current.cancelMfa();
      });

      expect(result.current.pendingUser).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe("signup", () => {
    it("fails if the username already exists", () => {
      const { result } = renderAuth();

      let response;
      act(() => {
        response = result.current.signup("1", "anyPassword", "Guest");
      });

      expect(response).toEqual({
        success: false,
        error: "Username already exists.",
      });
    });

    it("succeeds, adds the user to usersList, and persists only signed-up users to localStorage", () => {
      const { result } = renderAuth();

      let response;
      act(() => {
        response = result.current.signup("newUser", "newPassword", "Admin");
      });

      expect(response).toEqual({ success: true });
      expect(result.current.usersList).toContainEqual({
        username: "newUser",
        password: "newPassword",
        role: "Admin",
      });

      const stored = JSON.parse(localStorage.getItem("signedUpUsers"));
      expect(stored).toEqual([
        { username: "newUser", password: "newPassword", role: "Admin" },
      ]);
      expect(stored.some((u) => u.username === "1")).toBe(false);
    });

    it("lets a newly signed-up user log in immediately", () => {
      const { result } = renderAuth();

      act(() => {
        result.current.signup("newUser", "newPassword", "Admin");
      });

      let response;
      act(() => {
        response = result.current.login("newUser", "newPassword");
      });

      expect(response).toEqual({ success: true });
    });
  });

  describe("logout", () => {
    it("clears the user and removes them from localStorage", async () => {
      sendOTP.mockResolvedValue({ code: "123456", expiresAt: 999999 });
      verifyOTP.mockReturnValue({ success: true });
      const { result } = renderAuth();

      act(() => {
        result.current.login("1", "1");
      });
      await act(async () => {
        await result.current.requestMfaCode();
      });
      act(() => {
        result.current.verifyMfaCode("123456");
      });

      expect(result.current.user).not.toBeNull();

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem("loggedIn")).toBeNull();
    });
  });

  describe("initial state from localStorage", () => {
    it("restores a logged-in user from localStorage on mount", () => {
      localStorage.setItem(
        "loggedIn",
        JSON.stringify({ username: "1", role: "Guest" }),
      );

      const { result } = renderAuth();

      expect(result.current.user).toMatchObject({ username: "1" });
    });

    it("merges signed-up users from localStorage into usersList on mount", () => {
      localStorage.setItem(
        "signedUpUsers",
        JSON.stringify([{ username: "persisted", password: "pw", role: "Guest" }]),
      );

      const { result } = renderAuth();

      expect(result.current.usersList).toContainEqual({
        username: "persisted",
        password: "pw",
        role: "Guest",
      });
    });
  });
});