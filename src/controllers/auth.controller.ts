/**
 * Required External Modules
 */
import { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { CREDENTIALS_PATH, SCOPES, TOKEN_PATH } from "../configs/google.config";
import fs from "fs";
import { CredentialsOptionsRoutes } from "../interfaces/credentialsOptionsRoutes.interface";
import {
	loadSavedCredentialsIfExist,
	saveCredentials,
} from "../utils/googleAuth.util";

// define the credentials options
const credentialsOptions: CredentialsOptionsRoutes = {
	credentialsPath: CREDENTIALS_PATH,
	tokenPath: TOKEN_PATH,
};

/**
 * @class AuthController
 * @description class for auth controller
 * @property {OAuth2Client} oauth2Client - google oauth2 client
 * @public
 * @method googleAuthHandler - handler for /auth/google path
 * @method getTokenHandler - handler for /auth/get-token path
 */
export class AuthController {
	// google oauth2 client
	private oauth2Client: OAuth2Client = new OAuth2Client();

	constructor() {
		// load credentials from file if exist and set the oauth2 client
		// TODO - add error handling
		const credentials = JSON.parse(
			fs.readFileSync(credentialsOptions.credentialsPath, "utf-8")
		);

		this.oauth2Client = new OAuth2Client({
			clientId: credentials.installed.client_id,
			clientSecret: credentials.installed.client_secret,
			redirectUri: "https://localhost:3000/auth/get-token",
		});
	}

	/**
	 * @method googleAuthHandler - handler for /auth/google path
	 * @param {Request} req express request
	 * @param {Response} res express response
	 * @returns {Promise<void>}
	 */
	public async googleAuthHandler(
		_req: Request,
		res: Response,
		_next?: NextFunction
	) {
		// console.log("googleAuthHandler");

		const client: OAuth2Client | null = await loadSavedCredentialsIfExist(
			credentialsOptions
		);

		if (client) {
			this.oauth2Client = client;
			return res.sendStatus(200);
		}

		res.writeHead(301, {
			location: this.oauth2Client.generateAuthUrl({
				access_type: "offline",
				scope: SCOPES,
				include_granted_scopes: true,
			}),
		});
		res.send();
	}

	/**
	 * @method getTokenHandler - handler for /auth/get-token path
	 * @param {Request} req express request
	 * @param {Response} res express response
	 * @param {NextFunction} next express next function
	 * @returns {Promise<void>}
	 */
	public async getTokenHandler(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		if (!req.query?.code) {
			if (req.query?.error) return next(new Error(req.query.error as string));
			else return next(new Error("No code provided"));
		}
		const code = req.query.code as string;
		const { tokens } = await this.oauth2Client.getToken(code);
		this.oauth2Client.setCredentials(tokens);
		await saveCredentials(this.oauth2Client, credentialsOptions);
		res.sendStatus(200);
	}
}
