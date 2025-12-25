import { ResourceService, ModelResource } from './resource.service';
export declare class ResourceController {
    private resourceService;
    constructor(resourceService: ResourceService);
    getModels(): Promise<ModelResource[]>;
    getModelUrl(id: string): Promise<{
        url: string;
    }>;
    uploadModel(file: Express.Multer.File): Promise<ModelResource>;
    deleteModel(id: string): Promise<{
        success: boolean;
    }>;
}
