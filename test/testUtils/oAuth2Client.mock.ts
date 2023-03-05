// Workaround for jest.mock() not working with TypeScript
import { jest } from "@jest/globals";
jest.mock("google-auth-library");
