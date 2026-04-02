import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { requirePushsaferSecret } from "./requirePushsaferSecret";

const TEST_SECRET = "a".repeat(32);

vi.mock("../env", () => ({
  env: {
    PUSHSAFER_WEBHOOK_SECRET: "a".repeat(32),
  },
}));

vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createMockRequest(secret: string | undefined): Request {
  return {
    query: secret === undefined ? {} : { secret },
  } as unknown as Request;
}

describe("requirePushsaferSecret middleware", () => {
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

  describe("valid secret", () => {
    it("allows request with correct secret", () => {
      const mockReq = createMockRequest(TEST_SECRET);

      requirePushsaferSecret(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe("invalid secret", () => {
    it("blocks request with wrong secret", () => {
      const mockReq = createMockRequest("wrong-secret");

      requirePushsaferSecret(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith("Forbidden");
    });

    it("blocks request with no secret", () => {
      const mockReq = createMockRequest(undefined);

      requirePushsaferSecret(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("blocks request with empty secret", () => {
      const mockReq = createMockRequest("");

      requirePushsaferSecret(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("blocks request with secret that is a partial match", () => {
      const mockReq = createMockRequest(TEST_SECRET.slice(0, 16));

      requirePushsaferSecret(mockReq, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
