/**
 * Required External Modules
 */
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import RouterAndPath from "../interfaces/routerAndPath.interface";
import logger from "../utils/logger.util";

/**
 * Router Definition for /auth path
 * @class AuthRouter
 * @description class for /auth path
 * @property {string} path - path for the router
 * @property {Router} router - express router
 * @implements {RouterAndPath}
 * @public
 */
export default class AuthRouter implements RouterAndPath {
	// path for the router
	public path = "/auth";
	// initialize the express router
	public router = Router();

	constructor() {
		logger.debug("AuthRouter - constructor");

		// initialize the auth controller and call the routes
		const authController = new AuthController();
		this.router.get(
			"/google",
			authController.googleAuthHandler.bind(authController)
		);
		this.router.get(
			"/get-token",
			authController.getTokenHandler.bind(authController)
		);
	}
}
