import { AbstractCommand } from "../abstract/AbstractCommand";
import { AssetsController } from "../controllers/AssetsController";

export class AssetsCommand extends AbstractCommand<AssetsController> {
	public readonly name = "AssetsCommand";

	public execute(methodName: string, payload: unknown): unknown {
		if (methodName === "resolveImageSrc") {
			const { src } = payload as { src: string };
			return this.controller.resolveImageSrc(src);
		}
		throw new Error(`Unknown method: ${methodName}`);
	}
}
