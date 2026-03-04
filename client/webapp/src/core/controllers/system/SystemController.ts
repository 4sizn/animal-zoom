import { AbstractCommand } from "../../abstract/AbstractCommand";
import { AbstractController } from "../../abstract/AbstractController";
import { AssetsCommand } from "../../commands/AssetsCommand";
import { StorageCommand } from "../../commands/StorageCommand";
import { CommandManager } from "../../managers/CommandManager";
import { AssetsController } from "../AssetsController";
import { StorageController } from "../StorageController";

export class SystemController extends AbstractController {
	public readonly name: string;
	private controller: AbstractController;
	private command?: AbstractCommand<AbstractController>;

	public constructor(controller: AbstractController) {
		super();
		this.controller = controller;
		this.name = controller.name;
		this.initialize();
	}

	private initialize(): void {
		this.command = this.createCommandForController();
		if (this.command) {
			CommandManager.getInstance().registerCommand(
				this.command as AbstractCommand<AbstractController>,
			);
		}
	}

	public destroy(): void {
		if (this.command) {
			CommandManager.getInstance().unregisterCommand(this.command.name);
		}
	}

	private createCommandForController():
		| AbstractCommand<AbstractController>
		| undefined {
		if (this.controller instanceof StorageController) {
			return new StorageCommand(this.controller as StorageController) as any;
		}
		if (this.controller instanceof AssetsController) {
			return new AssetsCommand(this.controller as AssetsController) as any;
		}
		return undefined;
	}

	public getCommand(): AbstractCommand<AbstractController> | undefined {
		return this.command;
	}

	public getController(): AbstractController {
		return this.controller;
	}
}
