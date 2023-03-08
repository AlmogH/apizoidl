// Workaround for jest.mock() not working with TypeScript
import { jest } from "@jest/globals";

jest.mock("../../src/configs/ssl.config", () => {
	return {
		__esModule: true,
		default: {
			key: "key",
			cert: "cert",
		},
	};
});
