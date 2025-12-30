import { NextFunction, Request, Response } from "express";
import { PUSHSAFER_API_HOSTS } from "../constants/constants";
import { logger } from "../logger";

export const requirePushsaferIP = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let clientIp = req.ip; // get client IP from request

  // also check x-forwarded-for header (in case behind proxies) for more reliable IP retrieval
  if (!clientIp && req.headers["x-forwarded-for"]) {
    const forwarded = req.headers["x-forwarded-for"];
    clientIp = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(",")[0];
  }

  // ensure clientip is string
  clientIp = clientIp || "";

  // strip IPv6 prefix if present
  if (clientIp.startsWith("::ffff:")) {
    clientIp = clientIp.substring(7);
  }

  // debugging info, can be removed if confirmed to work
  logger.info(
    {
      detectedIp: clientIp,
      headers: req.headers["x-forwarded-for"],
    },
    "Checking IP of incoming Pushsafer webhook request"
  );

  if (!PUSHSAFER_API_HOSTS.includes(clientIp)) {
    logger.warn({ ip: clientIp }, "Unauthorized webhook attempt");
    res.status(403).send("Forbidden");
    return;
  }

  next();
};
