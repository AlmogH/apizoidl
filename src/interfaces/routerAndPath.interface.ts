/**
 * Required External Modules
 */
import { Router } from "express";

/**
 * @interface RouterAndPath
 * @description interface for router and path
 * @property {string} path - path for the router
 * @property {Router} router - express router
 * @example
 * const routes: RouterAndPath[] = [
 * new authRouter()
 * ];
 */
export default interface RouterAndPath {
	// path for the router
	path: string;
	// express router
	router: Router;
}
