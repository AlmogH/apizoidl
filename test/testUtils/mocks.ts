import { jest } from "@jest/globals";

export const OAuth2ClientMock = () => {
	const MockedOAuth2Client = jest.fn(() => ({}));
	jest.mock("google-auth-library", () => {
		const actual = jest.requireActual("google-auth-library");
		return {
			__esModule: true,
			...(actual as object),
			OAuth2Client: MockedOAuth2Client,
		};
	});
	return MockedOAuth2Client;
};

export const fsMock = () => {
	jest.mock("fs/promises");
	jest.mock("fs", () => {
		const actual = jest.requireActual("fs");
		return {
			__esModule: true,
			...(actual as object),
			readFileSync: jest.fn().mockReturnValue(
				Buffer.from(
					JSON.stringify({
						installed: {
							client_id: "mock_client_id",
							client_secret: "mock_client_secret",
						},
					})
				)
			),
		};
	});
};
