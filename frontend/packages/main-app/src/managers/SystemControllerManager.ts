import { SystemController } from "@/controllers/system/SystemController";

export class SystemControllerManager {
	private static instance: SystemControllerManager;
	private systemControllers: Map<string, SystemController> = new Map();
	private constructor() {}
	public static getInstance(): SystemControllerManager {
		if (!SystemControllerManager.instance) {
			SystemControllerManager.instance = new SystemControllerManager();
		}
		return SystemControllerManager.instance;
	}
	public registerSystemController(systemController: SystemController): void {
		this.systemControllers.set(systemController.name, systemController);
	}
	public getSystemController(name: string) {
		return this.systemControllers.get(name);
	}
	public destroySystemController(name: string): void {
		this.systemControllers.delete(name);
	}
}
