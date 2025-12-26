import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export type AssetType = 'avatar' | 'texture' | 'accessory' | 'environment';
export type AssetStatus = 'active' | 'deprecated' | 'archived';

export interface AssetCatalogTable {
  id: Generated<string>;
  assetType: AssetType;
  name: string;
  key: string;
  category: string;
  tags: string[];
  version: string;
  fileSize: number;
  mimeType: string;
  thumbnailKey: string | null;
  metadata: Record<string, any> | null;
  uploadedBy: string;
  status: AssetStatus;
  createdAt: Generated<Date>;
  updatedAt: Date;
}

export type AssetCatalog = Selectable<AssetCatalogTable>;
export type NewAssetCatalog = Insertable<AssetCatalogTable>;
export type AssetCatalogUpdate = Updateable<AssetCatalogTable>;
