import type { AbstractController } from "./AbstractController";

export abstract class AbstractCommand<
	TController extends AbstractController = AbstractController,
> {
	public abstract readonly name: string;
	public readonly controller: TController;

	public constructor(controller: TController) {
		this.controller = controller;
	}

	public abstract execute(methodName: string, payload: unknown): void;
}
