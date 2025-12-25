import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourceService, ModelResource } from './resource.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  @Get('models')
  async getModels(): Promise<ModelResource[]> {
    return this.resourceService.getAvailableModels();
  }

  @Get('models/:id')
  async getModelUrl(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.resourceService.getModelUrl(id);
    return { url };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadModel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: /\.(glb)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<ModelResource> {
    return this.resourceService.uploadModel(file);
  }

  @Delete('models/:id')
  async deleteModel(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.resourceService.deleteModel(id);
    return { success: true };
  }
}
