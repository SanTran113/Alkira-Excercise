import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendOTP, verifyOTP } from "./mfaService";

describe("mfaService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("sendOTP", () => {
    it("resolves with a 6-digit code and an expiresAt timestamp", async () => {
      const now = 1_000_000;
      vi.setSystemTime(now);

      const promise = sendOTP("testUser");
      await vi.advanceTimersByTimeAsync(400);
      const result = await promise;

      expect(result.code).toMatch(/^\d{6}$/);
      expect(result.expiresAt).toBe(now + 30_000);
    });

    it("does not resolve before the simulated delay elapses", async () => {
      const resolved = vi.fn();
      sendOTP("testUser").then(resolved);

      await vi.advanceTimersByTimeAsync(399);
      expect(resolved).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(resolved).toHaveBeenCalled();
    });

    it("generates a code within the expected 6-digit numeric range", async () => {
      // Force Math.random to its extremes to confirm generateOTP's bounds.
      const randomSpy = vi.spyOn(Math, "random");

      randomSpy.mockReturnValue(0);
      let promise = sendOTP("testUser");
      await vi.advanceTimersByTimeAsync(400);
      let result = await promise;
      expect(result.code).toBe("100000");

      randomSpy.mockReturnValue(0.999999999);
      promise = sendOTP("testUser");
      await vi.advanceTimersByTimeAsync(400);
      result = await promise;
      expect(result.code).toBe("999999");
    });

    it("logs the generated code for the given username", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      const promise = sendOTP("alice");
      await vi.advanceTimersByTimeAsync(400);
      const result = await promise;

      expect(logSpy).toHaveBeenCalledWith(
        `Sending OTP for alice: ${result.code}`,
      );
    });
  });

  describe("verifyOTP", () => {
    it("returns success when the code matches and has not expired", () => {
      const now = 1_000_000;
      vi.setSystemTime(now);

      const result = verifyOTP("123456", "123456", now + 1000);

      expect(result).toEqual({ success: true });
    });

    it("returns an error when the code has expired, even if it matches", () => {
      const now = 1_000_000;
      vi.setSystemTime(now);

      const result = verifyOTP("123456", "123456", now - 1);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/expired/i);
    });

    it("returns an error when the code does not match and has not expired", () => {
      const now = 1_000_000;
      vi.setSystemTime(now);

      const result = verifyOTP("000000", "123456", now + 1000);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/incorrect code/i);
    });

    it("prioritizes the expiration check over the mismatch check", () => {
      const now = 1_000_000;
      vi.setSystemTime(now);

      // Both wrong and expired: expiration message should win per the
      // function's if/else ordering.
      const result = verifyOTP("000000", "123456", now - 1);

      expect(result.error).toMatch(/expired/i);
    });

    it("treats a code expiring at exactly the current time as expired", () => {
      const now = 1_000_000;
      vi.setSystemTime(now);

      // expiresAt < Date.now() is false when equal, so this should NOT
      // be treated as expired.
      const result = verifyOTP("123456", "123456", now);

      expect(result).toEqual({ success: true });
    });
  });
});