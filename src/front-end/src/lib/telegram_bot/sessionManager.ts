import { SessionState } from "./constants";

export const userSessions = new Map<number, SessionState>();
export const userTelegramToDbId = new Map<number, number>();
export const pendingUserData = new Map<number, Partial<any>>();
export const roleSelectionMap = new Map<number, Record<string, string>>();
