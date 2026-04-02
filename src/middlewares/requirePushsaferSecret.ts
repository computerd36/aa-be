import { NextFunction, Request, Response } from "express";
import { env } from "../env";
import { logger } from "../logger";

export const requirePushsaferSecret = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secret = req.query.secret;

  if (secret !== env.PUSHSAFER_WEBHOOK_SECRET) {
    logger.warn("Unauthorized webhook attempt: invalid secret");
    res.status(403).send("Forbidden");
    return;
  }

  next();
};
