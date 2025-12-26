import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AssetCatalogService } from './asset-catalog.service.js';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetFilterDto,
  AssetResponseDto,
  AssetType,
  AssetStatus,
} from './dto/asset-catalog.dto.js';

@ApiTags('Asset Catalog')
@Controller('resources/catalog')
export class AssetCatalogController {
  constructor(private readonly assetCatalogService: AssetCatalogService) {}

  /**
   * List assets with optional filters
   * GET /resources/catalog
   */
  @Get()
  @ApiOperation({ summary: 'List all assets with filtering and pagination' })
  @ApiQuery({ name: 'assetType', required: false, enum: AssetType })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: AssetStatus })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of assets with pagination info',
  })
  async listAssets(@Query() filters: AssetFilterDto) {
    return this.assetCatalogService.listAssets(filters);
  }

  /**
   * Get asset by ID
   * GET /resources/catalog/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get asset details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Asset details',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async getAsset(@Param('id') id: string): Promise<AssetResponseDto | null> {
    return this.assetCatalogService.findAssetById(id);
  }

  /**
   * Create asset metadata entry
   * POST /resources/catalog
   */
  @Post()
  @ApiOperation({ summary: 'Create asset metadata entry (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Asset created',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createAsset(
    @Body() createDto: CreateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.assetCatalogService.createAsset(createDto);
  }

  /**
   * Update asset metadata
   * PATCH /resources/catalog/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update asset metadata (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Asset updated',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async updateAsset(
    @Param('id') id: string,
    @Body() updateDto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.assetCatalogService.updateAsset(id, updateDto);
  }

  /**
   * Deprecate asset (soft delete)
   * DELETE /resources/catalog/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Deprecate asset (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Asset deprecated',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async deprecateAsset(@Param('id') id: string): Promise<AssetResponseDto> {
    return this.assetCatalogService.deprecateAsset(id);
  }
}
