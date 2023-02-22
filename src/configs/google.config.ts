import path from "path";
export const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
export const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
export const TOKEN_PATH = path.join(process.cwd(), "token.json");
