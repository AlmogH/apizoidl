/**
 * Required External Modules and Interfaces
 * @description import the required modules and interfaces
 */
import * as dotenv from "dotenv";
import authRouter from "./routes/auth.route";
import https from "https";
import options from "./configs/ssl.config";
import App from "./app";

dotenv.config();

/**
 * App Variables
 * @constant PORT
 * @type {number}
 * @default 3000
 * @description port number for the server
 */

const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

/**
 *  App Configuration
 * @description create a new express app instance
 */
const app = new App([new authRouter()]).getServer();

/**
 * Server Activation
 * @description create a new https server instance and listen on the port
 */
https.createServer(options, app).listen(PORT, () => {
	console.log(`Listening at https://localhost:${PORT}`);
});
