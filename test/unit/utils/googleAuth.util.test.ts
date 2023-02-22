import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { fsMock } from "../../testUtils/mocks";
fsMock();

import { promises as fs } from "fs";
import { GoogleUtils } from "../../../src/utils/googleAuth.util";
import { OAuth2Client } from "google-auth-library";

// Create a mock OAuth2Client object for testing
const mockOAuth2Client = {
	credentials: {
		refresh_token: "mock_refresh_token",
	},
} as OAuth2Client;

// Create a mock google credentials object for testing
const mockGoogleCredentials = {
	installed: {
		type: "authorized_user",
		client_id: "mock_client_id",
		client_secret: "mock_client_secret",
	},
};

// Create a mock token object for testing
const mockToken = {
	type: "authorized_user",
	client_id: "mock_client_id",
	client_secret: "mock_client_secret",
	refresh_token: "mock_refresh_token",
};

// Create a mock options object for testing
const mockOptions: CredentialsOptionsRoutes = {
	credentialsPath: "/mock/credentials.json",
	tokenPath: "/mock/token.json",
};

describe("loadSavedCredentialsIfExist", () => {
	test("should return OAuth2Client when TOKEN_PATH exists", async () => {
		const mockReadFile = jest
			.spyOn(fs, "readFile")
			.mockResolvedValueOnce(Buffer.from(JSON.stringify(mockToken)));
		const result = await GoogleUtils.loadSavedCredentialsIfExist(mockOptions);
		expect(mockReadFile).toBeCalledWith(mockOptions.tokenPath);
		expect(result).toBeInstanceOf(OAuth2Client);
	});

	test("should return null when TOKEN_PATH does not exist", async () => {
		const mockReadFile = jest
			.spyOn(fs, "readFile")
			.mockRejectedValueOnce(new Error("File not found"));
		const result = await GoogleUtils.loadSavedCredentialsIfExist(mockOptions);
		expect(mockReadFile).toBeCalledWith(mockOptions.tokenPath);
		expect(result).toBeNull();
	});
});

import { CredentialsOptionsRoutes } from "../../../src/interfaces/credentialsOptionsRoutes.interface";

describe("saveCredentials", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test.each([
		[mockGoogleCredentials, mockOAuth2Client],
		[
			{
				web: mockGoogleCredentials.installed,
			},
			mockOAuth2Client,
		],
		[mockGoogleCredentials, { credentials: {} } as OAuth2Client],
	])(
		"should save the credentials to a file with %j credentials and OAuth2Client %j",
		async (mockCredentials, mockClient) => {
			// Mock the fs module to return the contents of the credentials file and to write to the token file
			const mockReadFile = jest
				.spyOn(fs, "readFile")
				.mockResolvedValueOnce(JSON.stringify(mockCredentials));
			const mockWriteFile = jest
				.spyOn(fs, "writeFile")
				.mockResolvedValueOnce(undefined);

			// Call the saveCredentials function with the mock OAuth2Client and options objects
			await GoogleUtils.saveCredentials(mockClient, mockOptions);

			// Assert that the fs module was called with the correct arguments
			expect(mockReadFile).toHaveBeenCalledWith(mockOptions.credentialsPath);
			expect(mockWriteFile).toHaveBeenCalledWith(
				mockOptions.tokenPath,
				JSON.stringify({
					...mockGoogleCredentials.installed,
					...mockClient.credentials,
				})
			);
		}
	);

	test("should throw an error if the credentials file cannot be read", async () => {
		// Mock the fs module to throw an error when reading the credentials file
		const mockReadFile = jest
			.spyOn(fs, "readFile")
			.mockRejectedValueOnce(new Error("Unable to read file"));

		// Call the saveCredentials function with the mock OAuth2Client and options objects, and expect it to throw an error
		await expect(
			GoogleUtils.saveCredentials(mockOAuth2Client, mockOptions)
		).rejects.toThrow("Unable to read file");

		// Assert that the fs module was called with the correct arguments
		expect(mockReadFile).toHaveBeenCalledWith("/mock/credentials.json");
	});

	test("should throw an error if the token file cannot be written", async () => {
		// Mock the fs module to return the contents of the credentials file, but throw an error when writing to the token file
		const mockReadFile = jest
			.spyOn(fs, "readFile")
			.mockResolvedValueOnce(JSON.stringify(mockGoogleCredentials));
		const mockWriteFile = jest
			.spyOn(fs, "writeFile")
			.mockRejectedValueOnce(new Error("Unable to write file"));

		// Call the saveCredentials function with the mock OAuth2Client and options objects, and expect it to throw an error
		await expect(
			GoogleUtils.saveCredentials(mockOAuth2Client, mockOptions)
		).rejects.toThrow("Unable to write file");

		// Assert that the fs module was called with the correct arguments
		expect(mockReadFile).toHaveBeenCalledWith("/mock/credentials.json");
		expect(mockWriteFile).toHaveBeenCalledWith(
			"/mock/token.json",
			JSON.stringify({
				...mockGoogleCredentials.installed,
				...mockOAuth2Client.credentials,
			})
		);
	});
});
