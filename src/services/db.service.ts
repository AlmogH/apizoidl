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
class DataBaseService {
	private static instance: DataBaseService;
	private db: Low;

	private constructor() {
		this.db = new Low(new JSONFile(dbFile));
	}

	public static getInstance(): DataBaseService {
		if (!DataBaseService.instance) {
			DataBaseService.instance = new DataBaseService();
		}

		return DataBaseService.instance;
	}

	public getDb(): Low {
		return this.db;
	}
}

export default DataBaseService;
