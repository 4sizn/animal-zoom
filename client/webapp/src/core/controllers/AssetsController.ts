import { resolveAssetImageSrc } from "../../network/assets";
import { AbstractController } from "../abstract/AbstractController";

export class AssetsController extends AbstractController {
	public readonly name = "AssetsController";

	public async resolveImageSrc(src: string): Promise<string> {
		return await resolveAssetImageSrc(src);
	}
}
