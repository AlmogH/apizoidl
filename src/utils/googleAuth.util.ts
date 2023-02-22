/**
 * Required External Modules
 */
import { promises as fs } from "fs";
import { OAuth2Client, JWTInput } from "google-auth-library";
import { CredentialsOptionsRoutes } from "../interfaces/credentialsOptionsRoutes.interface";

export class GoogleUtils {
	/**
	 * Reads previously authorized credentials from the save file.
	 *
	 * @return {Promise<OAuth2Client|null>}
	 */
	public static async loadSavedCredentialsIfExist(
		options: CredentialsOptionsRoutes
	): Promise<OAuth2Client | null> {
		try {
			const content = await fs.readFile(options.tokenPath);
			const credentials = JSON.parse(content.toString());

			const oauth2Client = new OAuth2Client({
				clientId: credentials.client_id,
				clientSecret: credentials.client_secret,
			});

			oauth2Client.setCredentials({
				refresh_token: credentials.refresh_token,
			});
			return oauth2Client;
		} catch (err) {
			return null;
		}
	}

	/**
	 * This function serializes credentials to a file compatible with GoogleAuth.fromJSON.
	 * It takes an OAuth2Client object and a SaveCredentialsOptions object as input and returns a Promise that resolves to void.
	 * @param {OAuth2Client} client
	 * @return {Promise<void>}
	 */
	public static async saveCredentials(
		client: OAuth2Client,
		options: CredentialsOptionsRoutes
	) {
		// Read the contents of the credentials file
		const content = await fs.readFile(options.credentialsPath);

		// Parse the credentials file contents to extract the keys object
		const keys = JSON.parse(content.toString());

		// Extract the installed or web key from the keys object and create a new credentials object
		const key = keys.installed || keys.web;
		const payload: JWTInput = {
			type: "authorized_user",
			client_id: key.client_id,
			client_secret: key.client_secret,
			refresh_token: client.credentials.refresh_token || undefined,
		};

		// Write the new credentials object to a file specified by tokenPath
		await fs.writeFile(options.tokenPath, JSON.stringify(payload));
	}
}
