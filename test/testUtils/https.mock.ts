// Workaround for jest.mock() not working with TypeScript
import { jest } from "@jest/globals";
const appListen = jest.fn().mockImplementation((_port, callback) => {
	(callback as () => object)();
});
const createServer = jest.fn().mockImplementation((_options, _app) => {
	return {
		listen: appListen,
	};
});
jest.mock("https", () => {
	return {
		__esModule: true,
		default: {
			createServer,
		},
	};
});
export { createServer, appListen };
