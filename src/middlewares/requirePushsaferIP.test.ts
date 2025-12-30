import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { requirePushsaferIP } from "./requirePushsaferIP";
import { PUSHSAFER_API_HOSTS } from "../constants/constants";

// mock for logger
vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// helper to create mock Request objects
function createMockRequest(
  ip: string | undefined,
  headers: Record<string, string | string[] | undefined> = {}
): Request {
  return {
    ip,
    headers,
  } as unknown as Request;
}

describe("requirePushsaferIP middleware", () => {
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe("allowed IPs", () => {
    it("allows request from first Pushsafer IPv4 address", () => {
      const mockReq = createMockRequest(PUSHSAFER_API_HOSTS[0]); // "212.83.36.91"

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("allows request from Pushsafer IPv6 address", () => {
      const mockReq = createMockRequest(PUSHSAFER_API_HOSTS[1]); // "2a00:f48:cafe:a911::1"

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("allows request with IPv6 prefix stripped from allowed IP", () => {
      const mockReq = createMockRequest(`::ffff:${PUSHSAFER_API_HOSTS[0]}`);

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("blocked IPs", () => {
    it("blocks request from unknown IPv4 address", () => {
      const mockReq = createMockRequest("192.168.1.1");

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith("Forbidden");
    });

    it("blocks request from unknown IPv6 address", () => {
      const mockReq = createMockRequest("2001:db8::1");

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("blocks request from localhost", () => {
      const mockReq = createMockRequest("127.0.0.1");

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("blocks request with empty IP", () => {
      const mockReq = createMockRequest("");

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("blocks request with undefined IP and no x-forwarded-for", () => {
      const mockReq = createMockRequest(undefined, {});

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe("x-forwarded-for header handling", () => {
    it("uses x-forwarded-for when req.ip is undefined (string value)", () => {
      const mockReq = createMockRequest(undefined, {
        "x-forwarded-for": PUSHSAFER_API_HOSTS[0],
      });

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("uses first IP from comma-separated x-forwarded-for", () => {
      const mockReq = createMockRequest(undefined, {
        "x-forwarded-for": `${PUSHSAFER_API_HOSTS[0]}, 10.0.0.1, 192.168.1.1`,
      });

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("uses first element when x-forwarded-for is an array", () => {
      const mockReq = createMockRequest(undefined, {
        "x-forwarded-for": [PUSHSAFER_API_HOSTS[0], "10.0.0.1"],
      });

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("blocks when x-forwarded-for contains unauthorized IP", () => {
      const mockReq = createMockRequest(undefined, {
        "x-forwarded-for": "192.168.1.100",
      });

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("prefers req.ip over x-forwarded-for when both present", () => {
      // When req.ip is set, x-forwarded-for should not be checked
      const mockReq = createMockRequest(PUSHSAFER_API_HOSTS[0], {
        "x-forwarded-for": "192.168.1.1",
      });

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("IPv6 prefix stripping", () => {
    it("strips ::ffff: prefix from IPv4-mapped IPv6 addresses", () => {
      const mockReq = createMockRequest("::ffff:212.83.36.91");

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("does not modify non-mapped addresses", () => {
      const mockReq = createMockRequest(PUSHSAFER_API_HOSTS[1]); // Pure IPv6

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("blocks unauthorized IP even after prefix stripping", () => {
      const mockReq = createMockRequest("::ffff:192.168.1.1");

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe("edge cases", () => {
    it("handles IP with extra whitespace gracefully", () => {
      // The current implementation doesn't trim, but let's test the behavior
      const mockReq = createMockRequest(" 212.83.36.91 ");

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      // Will fail because whitespace is not trimmed - this documents current behavior
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("handles case where IP is similar but not exact match", () => {
      const mockReq = createMockRequest("212.83.36.911"); // Extra digit

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("handles partial IPv6 match correctly", () => {
      const mockReq = createMockRequest("2a00:f48:cafe:a911::2"); // Different last segment

      requirePushsaferIP(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
