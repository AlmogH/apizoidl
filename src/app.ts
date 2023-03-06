/**
 * Required External Modules and Interfaces
 */
import cors from "cors";
import express from "express";
import helmet from "helmet";
import RouterAndPath from "./interfaces/routerAndPath.interface";
import { errorMiddleware } from "./middlewares/error.middleware";
import morganMiddleware from "./middlewares/morgan.middleware";

/**
 * Express App Class implementation
 * using express and helmet middlewares with cors enabled and custom error handling
 * @class App
 * @public
 * @method getServer
 * @method initializeMiddlewares
 * @method initializeErrorHandling
 * @method initializeRoutes
 * @example
 * const app = new App([
 * new authRouter()
 * ]).getServer();
 * app.listen(3000);
 */
export default class App {
	public app: express.Application;

	constructor(routes: RouterAndPath[]) {
		this.app = express();
		this.initializeMiddlewares();
		this.initializeRoutes(routes);
		this.initializeErrorHandling();
	}

	/**
	 * Get express app
	 * @returns express app
	 * @memberof App
	 * @public
	 * @method getServer
	 * @returns {express.Application}
	 * @example
	 * const app = new App().getServer();
	 * app.listen(3000);
	 */
	public getServer() {
		return this.app;
	}

	/**
	 * Initialize middlewares
	 */
	private initializeMiddlewares() {
		// helmet helps you secure your Express apps by setting various HTTP headers
		this.app.use(helmet());
		// cors enables Cross Origin Resource Sharing
		this.app.use(cors());
		// express.json() is a method inbuilt in express to recognize the incoming Request Object as a JSON Object
		this.app.use(express.json());
		// morgan is a HTTP request logger middleware for node.js
		this.app.use(morganMiddleware);
	}

	/**
	 * Initialize error handling middleware
	 */
	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}

	/**
	 * Initialize routes with path and router from routes array
	 * @param routes  array of routes with path and router
	 * @memberof App
	 * @private
	 * @method initializeRoutes
	 * @returns {void}
	 * @example
	 * const app = new App([
	 * new authRouter()
	 * ]);
	 * app.listen(3000);
	 */
	private initializeRoutes(routes: RouterAndPath[]) {
		routes.map((route) => {
			this.app.use(route.path, route.router);
		});
	}
}
