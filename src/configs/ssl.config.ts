import fs from "fs";
import path from "path";

export default {
	key: fs.readFileSync(path.resolve(__dirname, "./server.key")),
	cert: fs.readFileSync(path.resolve(__dirname, "./server.cert")),
};
