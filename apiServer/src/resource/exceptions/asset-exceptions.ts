import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown when asset validation fails
 */
export class AssetValidationException extends BadRequestException {
  constructor(message: string, details?: unknown) {
    super({
      message,
      error: 'Asset Validation Failed',
      details,
    });
  }
}

/**
 * Exception thrown when GLB file structure is invalid
 */
export class InvalidGlbStructureException extends AssetValidationException {
  constructor(reason: string) {
    super(`Invalid GLB file: ${reason}`, { reason });
  }
}

/**
 * Exception thrown when asset upload fails
 */
export class AssetUploadException extends BadRequestException {
  constructor(message: string, cause?: Error) {
    super({
      message,
      error: 'Asset Upload Failed',
      cause: cause?.message,
    });
  }
}

/**
 * Exception thrown when catalog operations fail
 */
export class AssetCatalogException extends BadRequestException {
  constructor(message: string, operation: string) {
    super({
      message,
      error: 'Asset Catalog Operation Failed',
      operation,
    });
  }
}
