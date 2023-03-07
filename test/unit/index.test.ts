/**
 * =============================================
 * ============= Testing imports ===============
 * =============================================
 */

import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import "../testUtils/app.mock";
import { appListen, createServer } from "../testUtils/https.mock";
import "../testUtils/winston.mock";

/**
 * =============================================
 * =================== Imports =================
 * =============================================
 */
import App from "../../src/app";
// import authRouter from "../../src/routes/auth.route";
// import dotenv from "dotenv";
import https from "https";
// import options from "../../src/configs/ssl.config";
import logger from "../../src/utils/logger.util";

// jest.mock("./app");
// jest.mock("https");

describe("server.ts", () => {
	const PORT = 3000;
	// const httpsMock = https as jest.Mocked<typeof https>;
	// const appListen = jest.fn().mockImplementation((port, callback) => {
	// 	(callback as () => object)();
	// });
	// const httpsCreateServer = jest.fn(() => ({
	// 	listen: appListen,
	// }));
	const mockApp = App as jest.MockedClass<typeof App>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApp.mockClear();
		// httpsMock.createServer.mockImplementation(httpsCreateServer);
		// httpsMock.createServer.listen.mockImplementation(appListen);
	});

	describe("Server Activation", () => {
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
});
