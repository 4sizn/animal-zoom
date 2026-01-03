#!/usr/bin/env tsx

/**
 * Migration Script: Migrate Existing Assets to Catalog
 *
 * This script scans the S3 bucket for existing GLB files and creates
 * asset catalog entries for them. It also updates user avatars to use
 * asset IDs instead of direct URLs.
 *
 * Usage:
 *   npm run migrate:assets              # Run migration
 *   npm run migrate:assets -- --dry-run # Preview without changes
 *
 * Features:
 * - Scans S3 bucket for GLB files
 * - Creates asset catalog entries with metadata
 * - Updates user avatarCustomization with asset IDs
 * - Supports dry-run mode for safe preview
 * - Comprehensive logging and error handling
 */

import { ConfigService } from '@nestjs/config';
import { S3Service } from '../src/resource/s3.service.js';
import { AssetCatalogService } from '../src/asset-catalog/asset-catalog.service.js';
import { DatabaseService } from '../src/database/database.service.js';
import {
  AssetType,
  CreateAssetDto,
} from '../src/asset-catalog/dto/asset-catalog.dto.js';

interface MigrationStats {
  assetsScanned: number;
  assetsCreated: number;
  avatarsUpdated: number;
  errors: number;
}

class AssetMigrationService {
  private stats: MigrationStats = {
    assetsScanned: 0,
    assetsCreated: 0,
    avatarsUpdated: 0,
    errors: 0,
  };

  constructor(
    private readonly s3Service: S3Service,
    private readonly assetCatalogService: AssetCatalogService,
    private readonly databaseService: DatabaseService,
    private readonly dryRun: boolean = false,
  ) {}

  /**
   * Run the full migration
   */
  async migrate(): Promise<MigrationStats> {
    console.log('🚀 Starting asset migration to catalog...');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}\n`);

    try {
      // Step 1: Scan S3 bucket for existing GLB files
      console.log('📂 Step 1: Scanning S3 bucket for GLB files...');
      const glbFiles = await this.scanS3ForGlbFiles();
      console.log(`Found ${glbFiles.length} GLB files\n`);

      // Step 2: Create catalog entries for each GLB file
      console.log('📝 Step 2: Creating catalog entries...');
      const assetMap = await this.createCatalogEntries(glbFiles);
      console.log(`Created ${this.stats.assetsCreated} catalog entries\n`);

      // Step 3: Update user avatars with asset IDs
      console.log('👤 Step 3: Updating user avatars...');
      await this.updateUserAvatars(assetMap);
      console.log(`Updated ${this.stats.avatarsUpdated} user avatars\n`);

      // Print summary
      this.printSummary();

      return this.stats;
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  /**
   * Scan S3 bucket for GLB files
   */
  private async scanS3ForGlbFiles(): Promise<string[]> {
    try {
      const result = await this.s3Service.listAssetsByPrefix('models/');
      const glbFiles = result.assets
        .map((asset) => asset.key)
        .filter((key) => key.endsWith('.glb') || key.endsWith('.gltf'));

      this.stats.assetsScanned = glbFiles.length;
      return glbFiles;
    } catch (error) {
      console.error('Error scanning S3:', error.message);
      return [];
    }
  }

  /**
   * Create catalog entries for GLB files
   * Returns a map of modelUrl -> assetId
   */
  private async createCatalogEntries(
    glbFiles: string[],
  ): Promise<Map<string, string>> {
    const assetMap = new Map<string, string>();

    for (const key of glbFiles) {
      try {
        console.log(`  Processing: ${key}`);

        // Extract metadata from key
        const metadata = this.extractMetadataFromKey(key);

        // Check if asset already exists in catalog
        const existingAssets = await this.assetCatalogService.listAssets({
          assetType: AssetType.AVATAR,
        });
        const exists = existingAssets.some((asset) => asset.key === key);

        if (exists) {
          console.log(`  ⏭️  Already exists in catalog, skipping`);
          const existingAsset = existingAssets.find(
            (asset) => asset.key === key,
          )!;
          assetMap.set(key, existingAsset.id);
          continue;
        }

        if (this.dryRun) {
          console.log(`  [DRY RUN] Would create catalog entry for: ${key}`);
          this.stats.assetsCreated++;
          assetMap.set(key, `dry-run-${this.stats.assetsCreated}`);
          continue;
        }

        // Create catalog entry
        const createDto: CreateAssetDto = {
          assetType: AssetType.AVATAR,
          name: metadata.name,
          key,
          category: metadata.category,
          tags: metadata.tags,
          version: metadata.version,
          fileSize: 0, // Will be updated by actual upload service
          mimeType: 'model/gltf-binary',
          uploadedBy: 'migration-script',
        };

        const asset = await this.assetCatalogService.createAsset(createDto);
        assetMap.set(key, asset.id);

        console.log(`  ✅ Created catalog entry: ${asset.id}`);
        this.stats.assetsCreated++;
      } catch (error) {
        console.error(`  ❌ Error processing ${key}:`, error.message);
        this.stats.errors++;
      }
    }

    return assetMap;
  }

  /**
   * Update user avatars to use asset IDs
   */
  private async updateUserAvatars(
    assetMap: Map<string, string>,
  ): Promise<void> {
    const db = this.databaseService.db;

    // Get all users with avatar customization
    const users = await db
      .selectFrom('users')
      .select(['id', 'avatarCustomization'])
      .where('avatarCustomization', 'is not', null)
      .execute();

    console.log(`Found ${users.length} users with avatars`);

    for (const user of users) {
      try {
        const avatarConfig = user.avatarCustomization as any;

        // Skip if already has modelAssetId
        if (avatarConfig?.modelAssetId) {
          console.log(`  ⏭️  User ${user.id} already has modelAssetId`);
          continue;
        }

        // Check if modelUrl matches any asset in our map
        const modelUrl = avatarConfig?.modelUrl;
        if (!modelUrl) {
          console.log(`  ⏭️  User ${user.id} has no modelUrl`);
          continue;
        }

        const assetId = assetMap.get(modelUrl);
        if (!assetId) {
          console.log(
            `  ⚠️  User ${user.id} modelUrl not found in catalog: ${modelUrl}`,
          );
          continue;
        }

        if (this.dryRun) {
          console.log(
            `  [DRY RUN] Would update user ${user.id} with assetId: ${assetId}`,
          );
          this.stats.avatarsUpdated++;
          continue;
        }

        // Update user with modelAssetId
        const updatedConfig = {
          ...avatarConfig,
          modelAssetId: assetId,
        };

        await db
          .updateTable('users')
          .set({ avatarCustomization: updatedConfig as any })
          .where('id', '=', user.id)
          .execute();

        console.log(`  ✅ Updated user ${user.id} with assetId: ${assetId}`);
        this.stats.avatarsUpdated++;
      } catch (error) {
        console.error(`  ❌ Error updating user ${user.id}:`, error.message);
        this.stats.errors++;
      }
    }
  }

  /**
   * Extract metadata from S3 key
   * Example: models/fox.glb -> { name: 'fox', category: 'animals', version: '1.0.0' }
   */
  private extractMetadataFromKey(key: string): {
    name: string;
    category: string;
    tags: string[];
    version: string;
  } {
    const filename = key.split('/').pop()!;
    const baseName = filename.replace(/\.(glb|gltf)$/, '');

    return {
      name: baseName,
      category: 'legacy', // Default category for migrated assets
      tags: ['migrated'],
      version: '1.0.0', // Default version for legacy assets
    };
  }

  /**
   * Print migration summary
   */
  private printSummary(): void {
    console.log('\n📊 Migration Summary:');
    console.log('─'.repeat(50));
    console.log(`  Assets scanned:      ${this.stats.assetsScanned}`);
    console.log(`  Catalog entries:     ${this.stats.assetsCreated}`);
    console.log(`  Avatars updated:     ${this.stats.avatarsUpdated}`);
    console.log(`  Errors:              ${this.stats.errors}`);
    console.log('─'.repeat(50));

    if (this.dryRun) {
      console.log('\n⚠️  This was a DRY RUN. No changes were made.');
      console.log('   Remove --dry-run flag to apply changes.\n');
    } else {
      console.log('\n✅ Migration completed successfully!\n');
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const dryRun = process.argv.includes('--dry-run');

  // Initialize services
  const configService = new ConfigService();
  const databaseService = new DatabaseService(configService);
  const s3Service = new S3Service(configService);
  const assetCatalogService = new AssetCatalogService(databaseService);

  const migrationService = new AssetMigrationService(
    s3Service,
    assetCatalogService,
    databaseService,
    dryRun,
  );

  try {
    await migrationService.migrate();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
