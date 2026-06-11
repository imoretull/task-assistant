import type { Request, Response, NextFunction } from "express";
import { resolveDb, type DB } from "./client.js";
import type { DatabaseId } from "./databases.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      db: DB;
      dbId: DatabaseId;
    }
  }
}

const HEADER = "x-database";

/** Resolve the active database for each request from the X-Database header
 *  (falling back to the default) and attach it to the request. Every route
 *  then operates only on that database's file — switching is atomic. */
export function dbContext(req: Request, _res: Response, next: NextFunction) {
  const raw = req.header(HEADER) ?? undefined;
  const { id, db } = resolveDb(raw);
  req.db = db;
  req.dbId = id;
  next();
}
