import { CommandManager } from "@/managers/CommandManager";
import { AbstractCommand } from "../abstract/AbstractCommand";
import { AbstractController } from "../abstract/AbstractController";

/*
 * @description
 * 시스템 컨트롤러
 * 컨트롤러와 명령어를 매핑하고 초기화 및 소멸을 관리합니다.
 */
export class SystemController extends AbstractController {
	public readonly name: string;
	controller: AbstractController;
	command?: AbstractCommand<AbstractController>;
	constructor(controller: AbstractController) {
		super();
		this.controller = controller;
		this.name = controller.name;
		this.initialize();
	}
	private initialize(): void {
		this.command = this.createCommandForController();
		console.log(
			"Frontend:SystemController.ts",
			"Command Created",
			this.command,
		);
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

	/**
	 * @description
	 * 컨트롤러 타입에 따라 적절한 Command 인스턴스를 생성
	 * 새로운 컨트롤러 타입이 추가되면 여기에 매핑 추가
	 */
	private createCommandForController():
		| AbstractCommand<AbstractController>
		| undefined {
		// 다른 컨트롤러 타입들도 여기에 추가할 수 있음
		// if (this.controller instanceof UnitySystemController) {
		//   return new UnitySystemCommand(this.controller as any) as AbstractCommand<T>;
		// }

		console.warn(
			`[SystemController] No command mapping found for controller: ${this.controller.name}`,
		);
		return undefined;
	}

	public getCommand(): AbstractCommand<AbstractController> | undefined {
		return this.command;
	}

	public getController(): AbstractController | undefined {
		return this.controller;
	}
}
