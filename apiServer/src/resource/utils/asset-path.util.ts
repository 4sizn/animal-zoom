import { AssetType } from '../../asset-catalog/dto/asset-catalog.dto.js';

/**
 * Generates a structured S3 path for asset storage
 *
 * Path format: assets/{type}/{category}/{version}/{id}{extension}
 * Example: assets/avatar/humanoid/1.0.0/uuid-123.glb
 *
 * @param assetType - Type of asset (avatar, texture, etc.)
 * @param category - Asset category (humanoid, animal, etc.)
 * @param version - Semantic version (1.0.0, 2.1.0, etc.)
 * @param id - Unique asset identifier (UUID)
 * @param extension - File extension including dot (.glb, .png, etc.)
 * @returns Structured S3 key path
 */
export function generateAssetPath(
  assetType: AssetType,
  category: string,
  version: string,
  id: string,
  extension: string,
): string {
  return `assets/${assetType}/${category}/${version}/${id}${extension}`;
}

/**
 * Extracts file extension from filename including the dot
 *
 * @param filename - Original filename
 * @returns Extension with dot (e.g., '.glb') or empty string
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.slice(lastDot);
}

/**
 * Parses structured asset path to extract components
 *
 * @param path - S3 key path (e.g., 'assets/avatar/humanoid/1.0.0/uuid-123.glb')
 * @returns Parsed path components or null if invalid format
 */
export function parseAssetPath(path: string): {
  assetType: string;
  category: string;
  version: string;
  id: string;
  extension: string;
} | null {
  const pathRegex = /^assets\/([^/]+)\/([^/]+)\/([^/]+)\/([^/.]+)(\.[^/]+)?$/;
  const match = path.match(pathRegex);

  if (!match) {
    return null;
  }

  return {
    assetType: match[1],
    category: match[2],
    version: match[3],
    id: match[4],
    extension: match[5] || '',
  };
}
