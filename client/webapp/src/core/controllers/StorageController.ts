import { getString, remove, setString } from "../../system/storage";
import { AbstractController } from "../abstract/AbstractController";

export class StorageController extends AbstractController {
	public readonly name = "StorageController";

	public getString(key: string): string | null {
		return getString(key);
	}

	public setString(key: string, value: string): void {
		setString(key, value);
	}

	public remove(key: string): void {
		remove(key);
	}
}
