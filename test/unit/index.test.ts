/**
 * =============================================
 * ============= Testing imports ===============
 * =============================================
 */

import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import "../testUtils/app.mock";
import { appListen, createServer } from "../testUtils/https.mock";
import "../testUtils/winston.mock";
import "../testUtils/fs.mock";

/**
 * =============================================
 * =================== Imports =================
 * =============================================
 */
import App from "../../src/app";
import logger from "../../src/utils/logger.util";

/**
 * =============================================
 * =================== Tests ===================
 * =============================================
 */
describe("server.ts", () => {
	const PORT = 3000;
	const mockApp = App as jest.MockedClass<typeof App>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("should create a new https server instance and listen on the port", () => {
		process.env.PORT = `${PORT}`;
		jest.isolateModules(() => require("../../src/index"));

		expect(createServer).toHaveBeenCalledWith(
			expect.any(Object),
			mockApp.prototype.getServer()
		);
		expect(appListen).toHaveBeenCalledWith(PORT, expect.any(Function));
		expect(logger.info).toHaveBeenCalledWith(
			`Listening at https://localhost:${PORT}`
		);
		process.env.PORT = undefined;
	});

	test("should create a new http server instance and listen on the port to 3000 on default", () => {
		jest.isolateModules(() => require("../../src/index"));
		expect(createServer).toHaveBeenCalledWith(
			expect.any(Object),
			mockApp.prototype.getServer()
		);
		expect(appListen).toHaveBeenCalledWith(PORT, expect.any(Function));
		expect(logger.info).toHaveBeenCalledWith(
			`Listening at https://localhost:${PORT}`
		);
	});

	test("should log an error and exit the process if the get server function doesn't work", () => {
		const mockProcessExit = jest
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);
		const error = new Error("Server failed to start");

		mockApp.prototype.getServer.mockImplementationOnce(() => {
			throw error;
		});
		jest.isolateModules(() => require("../../src/index"));
		expect(logger.error).toHaveBeenCalledWith(
			"Server can't start because of:\n" + error
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});

	test("should log an error and exit the process if the server fails to listen", () => {
		const mockProcessExit = jest
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);
		const error = new Error("Server failed to listen");
		appListen.mockImplementation((_port, _callback) => {
			throw error;
		});
		jest.isolateModules(() => require("../../src/index"));

		expect(logger.error).toHaveBeenCalledWith(
			"Server can't start because of:\n" + error
		);
		expect(mockProcessExit).toHaveBeenCalledWith(1);
	});
});
