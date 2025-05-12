export const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
export const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://parkxpress.vercel.app"
    : "http://localhost:3000"; // o tu URL ngrok

export type SessionState =
  | "awaiting_cedula"
  | "authenticated"
  | "register_name"
  | "register_lastname"
  | "register_ced"
  | "register_email"
  | "register_username"
  | "register_password"
  | "register_role"
  | "writing_note"
  | "create_cash_type"
  | "create_cash_amount"
  | "create_cash_date"
  | "create_role_name"
  | "awaiting_password";
