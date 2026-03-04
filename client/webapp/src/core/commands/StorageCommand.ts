import { AbstractCommand } from "../abstract/AbstractCommand";
import { StorageController } from "../controllers/StorageController";

export class StorageCommand extends AbstractCommand<StorageController> {
	public readonly name = "StorageCommand";

	public execute(methodName: string, payload: unknown): unknown {
		if (methodName === "getString") {
			const { key } = payload as { key: string };
			return this.controller.getString(key);
		}
		if (methodName === "setString") {
			const { key, value } = payload as { key: string; value: string };
			return this.controller.setString(key, value);
		}
		if (methodName === "remove") {
			const { key } = payload as { key: string };
			return this.controller.remove(key);
		}
		throw new Error(`Unknown method: ${methodName}`);
	}
}
