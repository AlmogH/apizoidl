// Workaround for jest.mock() not working with TypeScript
import { jest } from "@jest/globals";
const mockWinstonLogs = {
	info: jest.fn(),
	error: jest.fn(),
};

jest.mock("winston", () => ({
	createLogger: jest.fn().mockReturnValue(mockWinstonLogs),
	format: {
		combine: jest.fn(),
		timestamp: jest.fn(),
		colorize: jest.fn(),
		printf: jest.fn(),
	},
	transports: {
		Console: jest.fn(),
		File: jest.fn(),
	},
	addColors: jest.fn(),
}));

export { mockWinstonLogs };
