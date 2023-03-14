/**
 * =================================
 * ========= Import Modules ========
 * =================================
 */
import { Low } from "lowdb";
import { dbFile } from "../configs/db.config";
import { JSONFile } from "lowdb/lib/node";

/**
 * DataBase service class as singleton for lowdb
 */
class DatabaseService {
	private static instance: DatabaseService;
	private db: Low;

	private constructor() {
		this.db = new Low(new JSONFile(dbFile));
	}

	public static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService();
		}

		return DatabaseService.instance;
	}

	public getDb(): Low {
		return this.db;
	}
}

export default DatabaseService;
