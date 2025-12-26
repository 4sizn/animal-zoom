# Plan: Avatar Asset Resource Server System

**CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ DO NOT skip quality gates or proceed with failing checks

---

## Goal

Implement a comprehensive avatar asset resource server system that:
- Provides **local resource server** for development (no S3 dependency)
- Enhances **S3 integration** for production asset serving
- Creates **asset catalog system** with metadata, versioning, and search
- Integrates assets with **avatar rendering pipeline**
- Enables **CDN support** for production performance

---

## Current Architecture

### Existing Infrastructure:
- **API Server**: NestJS on port 3000 (HTTP), port 3001 (WebSocket)
- **S3 Integration**: AWS SDK v3 with presigned URLs (1-hour expiry)
- **ResourceService**: Handles GLB model upload/validation via S3
- **Client Loading**: ResourceLoader (LRU cache) → ResourceStorageAPI → SceneBuilder
- **Avatar System**: Database-backed with `avatarCustomization` JSONB in users table
- **Rendering**: Babylon.js with 3-tier fallback (GLB/GLTF → serializedData → sphere)

### Limitations:
- No local development resource server (requires S3 credentials)
- No asset catalog or metadata system
- No asset organization structure (flat `models/` folder)
- No asset versioning or CDN support
- No asset search or discovery

---

## Solution Architecture

**Integrated Approach** - Extend apiServer with asset management capabilities:
- **Asset Catalog Module**: Database-backed metadata system
- **Storage Strategy Pattern**: Interface for S3Service and LocalStorageService
- **Environment-Aware**: Dev uses local filesystem, prod uses S3/CDN
- **Backward Compatible**: Existing `modelUrl` field continues to work

---

## Implementation Phases

### Phase 1: Asset Catalog & Database Foundation ⏱️ 1-3 hours ✅ COMPLETED

**Goal**: Create asset metadata system with database-backed catalog

#### Tasks

**RED (Write Tests First):**
- [x] Write test: should create asset metadata entry
- [x] Write test: should list assets with filters (type, category, tags)
- [x] Write test: should find asset by ID
- [x] Write test: should update asset metadata
- [x] Write test: should mark asset as deprecated
- [x] Write test: should handle version conflicts
- [x] Write test: should validate asset metadata
- [x] Run tests to confirm failures: `npm test asset-catalog.service.spec.ts`

**GREEN (Implement):**
- [x] Create database migration: `src/database/migrations/002_asset_catalog.ts`
  - Table: `asset_catalog` with columns (id, assetType, name, key, category, tags, version, fileSize, mimeType, thumbnailKey, metadata, uploadedBy, status, createdAt, updatedAt)
  - Indexes: (assetType, category), (uploadedBy), (status), unique(key, version)
- [x] Create schema interface: `src/database/schema/asset-catalog.ts`
- [x] Update database schema: `src/database/schema/database.ts` (add asset_catalog table)
- [x] Create DTOs: `src/asset-catalog/dto/` (CreateAssetDto, UpdateAssetDto, AssetFilterDto, AssetResponseDto)
- [x] Create enums: AssetType, AssetCategory, AssetStatus
- [x] Implement AssetCatalogService: `src/asset-catalog/asset-catalog.service.ts`
  - CRUD operations for asset metadata
  - Search/filter by type, category, tags
  - Version management helpers
- [x] Run tests to confirm passing: `npm test asset-catalog.service.spec.ts`

**REFACTOR:**
- [x] Extract common validation logic to validators
- [x] Add JSDoc comments to service methods
- [x] Ensure error messages are descriptive
- [x] Run tests after refactoring to ensure still passing

#### Quality Gate Checklist

**Build & Compilation:**
- [x] Project builds without errors: `npm run build`
- [x] No TypeScript errors

**TDD Compliance:**
- [x] All tests written before implementation code
- [x] Tests failed initially (red phase confirmed)
- [x] Tests pass after implementation (green phase confirmed)

**Testing:**
- [x] All tests pass: `npm test asset-catalog`
- [x] Test coverage ≥90%: 95.96% statements coverage
- [x] No test warnings or console errors

**Database:**
- [x] Migration runs successfully: `npm run migration:run`
- [x] Migration rollback defined in down() function
- [x] Database constraints validated (foreign key to users.id, unique key+version)

**Code Quality:**
- [x] Linting passes: `npm run lint`
- [x] No unused imports or variables

#### Critical Files

- **CREATE**: `/src/database/migrations/002_asset_catalog.ts`
- **CREATE**: `/src/database/schema/asset-catalog.ts`
- **MODIFY**: `/src/database/schema/database.ts`
- **MODIFY**: `/src/database/schema/index.ts`
- **CREATE**: `/src/asset-catalog/asset-catalog.service.ts`
- **CREATE**: `/src/asset-catalog/dto/asset-catalog.dto.ts`
- **CREATE**: `/src/asset-catalog/__tests__/asset-catalog.service.spec.ts`

#### Rollback Plan

If issues arise:
1. Run migration rollback: `npm run migration:down`
2. Delete created files in `src/asset-catalog/`
3. Revert changes to `src/database/schema/`

---

### Phase 2: Enhanced S3 Service & Asset Organization ⏱️ 2-4 hours

**Goal**: Refactor S3Service for structured asset storage with organized paths

#### Tasks

**RED (Write Tests First):**
- [ ] Write test: should upload asset to structured path
- [ ] Write test: should generate presigned URL with custom expiry
- [ ] Write test: should list assets with pagination
- [ ] Write test: should copy asset for versioning
- [ ] Write test: should validate GLB structure
- [ ] Write test: should extract metadata (dimensions, polygons)
- [ ] Write test: should create catalog entry after S3 upload
- [ ] Write test: should rollback catalog on S3 failure
- [ ] Run tests to confirm failures

**GREEN (Implement):**
- [ ] Create asset storage interface: `src/resource/interfaces/asset-storage.interface.ts`
- [ ] Enhance S3Service: `src/resource/s3.service.ts`
  - Add `uploadAsset(file, metadata)` - structured upload
  - Add `generateAssetUrl(key, options)` - CDN or presigned
  - Add `listAssetsByPrefix(prefix, options)` - pagination
  - Add `copyAsset(srcKey, destKey)` - versioning support
  - Implement AssetStorageInterface
- [ ] Create GLB validator: `src/resource/validators/glb-validator.ts`
- [ ] Create metadata extractor: `src/resource/extractors/glb-metadata-extractor.ts`
- [ ] Create upload pipeline: `src/resource/asset-upload.service.ts`
  - Validation → S3 upload → Catalog entry (atomic)
  - Rollback on failure
- [ ] Add environment config: `src/config/asset-storage.config.ts`
  - ASSET_STORAGE_MODE: "s3" | "local" | "hybrid"
  - ASSET_CDN_URL
  - LOCAL_ASSETS_PATH
- [ ] Update `.env.example` with new config variables
- [ ] Run tests to confirm passing

**REFACTOR:**
- [ ] Extract S3 path generation to utility function
- [ ] Simplify error handling with custom exceptions
- [ ] Add logging for upload operations
- [ ] Run tests after refactoring

#### Quality Gate Checklist

**Build & Compilation:**
- [ ] Project builds without errors: `npm run build`
- [ ] No TypeScript errors

**TDD Compliance:**
- [ ] All tests written before implementation
- [ ] Red-Green-Refactor cycle followed

**Testing:**
- [ ] All tests pass: `npm test asset-upload.service`
- [ ] Test coverage ≥85%
- [ ] Integration test: full upload pipeline works end-to-end

**Functionality:**
- [ ] Upload creates file in structured path: `assets/{type}/{category}/{version}/{id}.glb`
- [ ] Catalog entry created atomically with S3 upload
- [ ] Rollback works on failure (no orphaned files or DB entries)

**Code Quality:**
- [ ] Linting passes
- [ ] No console.log statements (use logger)

#### Critical Files

- **MODIFY**: `/src/resource/s3.service.ts`
- **CREATE**: `/src/resource/interfaces/asset-storage.interface.ts`
- **CREATE**: `/src/resource/asset-upload.service.ts`
- **CREATE**: `/src/resource/validators/glb-validator.ts`
- **CREATE**: `/src/resource/extractors/glb-metadata-extractor.ts`
- **MODIFY**: `/.env.example`
- **CREATE**: `/src/config/asset-storage.config.ts`
- **CREATE**: `/src/resource/__tests__/asset-upload.service.spec.ts`

#### Rollback Plan

1. Revert S3Service changes
2. Keep asset_catalog table (unused, no impact)
3. Remove new files in `src/resource/`

---

### Phase 3: MinIO Docker Setup for Local Development ⏱️ 1-2 hours

**Goal**: Setup S3-compatible MinIO in Docker for local development (no code changes needed)

#### Tasks

**RED (Write Tests First):**
- [ ] Write test: S3Service should work with custom endpoint
- [ ] Write test: should upload to MinIO endpoint
- [ ] Write test: should generate URLs for MinIO assets
- [ ] Run tests to confirm failures

**GREEN (Implement):**
- [ ] Add MinIO to docker-compose.yml
- [ ] Update S3Service: `src/resource/s3.service.ts`
  - Add optional `endpoint` parameter to S3Client config
  - Read `AWS_ENDPOINT_URL` from environment (for MinIO)
  - Add `forcePathStyle: true` for MinIO compatibility
- [ ] Update `.env.example` with MinIO and AWS configurations
- [ ] Create bucket initialization script: `scripts/init-minio.sh`
  - Install MinIO Client (mc)
  - Create bucket if not exists
  - Set public read policy for assets
- [ ] Update Makefile with MinIO commands:
  - `make minio-init` - Initialize MinIO bucket
  - `make minio-console` - Open MinIO web console
  - `make minio-logs` - View MinIO logs
- [ ] Run tests to confirm passing

**REFACTOR:**
- [ ] Extract S3 client configuration to factory method
- [ ] Add logging for endpoint selection (MinIO vs AWS)
- [ ] Document MinIO setup in README
- [ ] Run tests after refactoring

#### Quality Gate Checklist

**Build & Compilation:**
- [ ] Project builds without errors: `npm run build`
- [ ] Docker builds successfully: `docker-compose build`

**TDD Compliance:**
- [ ] Tests written first, red-green-refactor followed

**Testing:**
- [ ] All tests pass with MinIO: `npm test s3.service`
- [ ] Test coverage maintained ≥85%

**Functionality:**
- [ ] Start MinIO: `docker-compose up minio -d`
- [ ] MinIO healthcheck passes: `docker-compose ps`
- [ ] Access MinIO console: `http://localhost:9001`
- [ ] Initialize bucket: `make minio-init`
- [ ] Upload test asset via API works
- [ ] Download asset URL works
- [ ] Start API server: connects to MinIO successfully
- [ ] No changes needed when switching to AWS S3 (just env vars)

**Docker:**
- [ ] MinIO container starts successfully
- [ ] Volume persists data across restarts
- [ ] Healthcheck works correctly

**Code Quality:**
- [ ] Linting passes
- [ ] S3Service works with both MinIO and AWS S3

#### Critical Files

- **MODIFY**: `/docker-compose.yml` (add minio service)
- **MODIFY**: `/src/resource/s3.service.ts` (add endpoint support)
- **MODIFY**: `/.env.example` (add MinIO config)
- **CREATE**: `/scripts/init-minio.sh` (bucket initialization)
- **MODIFY**: `/Makefile` (add MinIO commands)
- **MODIFY**: `/README.md` or `/PLAN_docker-environment.md` (MinIO documentation)
- **MODIFY**: `/src/resource/__tests__/s3.service.spec.ts` (test with endpoint)

#### Rollback Plan

1. Remove minio service from docker-compose.yml
2. Revert S3Service endpoint changes (optional - backward compatible)
3. Remove MinIO scripts and Makefile commands
4. Use AWS S3 credentials directly

---

### Phase 4: Asset Catalog API & Client Integration ⏱️ 3-4 hours

**Goal**: Expose asset catalog via REST API and integrate with client

#### Tasks

**RED (Write Tests First):**

**Server Tests:**
- [ ] Write test: should list assets with pagination
- [ ] Write test: should filter assets by type and category
- [ ] Write test: should return 404 for non-existent asset
- [ ] Write test: should require admin role for mutations
- [ ] Write test: should validate query parameters

**Client Tests:**
- [ ] Write test: should fetch asset list from API
- [ ] Write test: should cache asset list for 5 minutes
- [ ] Write test: should resolve local URLs in dev mode
- [ ] Write test: should resolve S3 URLs in prod mode
- [ ] Run tests to confirm failures

**GREEN (Implement):**

**Server:**
- [ ] Create AssetCatalogController: `src/asset-catalog/asset-catalog.controller.ts`
  - GET `/resources/catalog` - list assets with filters
  - GET `/resources/catalog/:id` - get asset details
  - POST `/resources/catalog` - create metadata (admin)
  - PATCH `/resources/catalog/:id` - update metadata (admin)
  - DELETE `/resources/catalog/:id` - deprecate asset (admin)
  - GET `/resources/catalog/search` - full-text search
- [ ] Create AssetCatalogModule: `src/asset-catalog/asset-catalog.module.ts`
- [ ] Update ResourceController: `src/resource/resource.controller.ts`
  - Add GET `/resources/assets/:type`
  - Add GET `/resources/assets/:id/url`
  - Update POST `/resources/upload` to use new pipeline
- [ ] Import AssetCatalogModule in AppModule

**Client:**
- [ ] Create AssetCatalogAPI: `web_core/src/api/assetCatalog.ts`
  - Methods: listAssets(), getAsset(), getAssetUrl()
  - 5-minute TTL cache
- [ ] Create AssetUrlResolver: `web_core/src/resources/AssetUrlResolver.ts`
  - Environment-aware URL resolution
  - Dev: `http://localhost:3000/assets/...`
  - Prod: S3 presigned URL or CDN
- [ ] Update ResourceStorageAPI: integrate with asset catalog
- [ ] Update web_core `.env.example` with `VITE_ASSET_MODE`
- [ ] Run tests to confirm passing

**REFACTOR:**
- [ ] Extract pagination logic to shared utility
- [ ] Simplify URL resolution with strategy pattern
- [ ] Add comprehensive API documentation (Swagger)
- [ ] Run tests after refactoring

#### Quality Gate Checklist

**Build & Compilation:**
- [ ] Server builds: `cd apiServer && npm run build`
- [ ] Client builds: `cd web_core && npm run build`

**TDD Compliance:**
- [ ] Tests written before implementation
- [ ] Red-green-refactor cycle followed

**Testing:**
- [ ] Server tests pass: `npm test asset-catalog.controller`
- [ ] Client tests pass: `npm test AssetCatalogAPI`
- [ ] Integration test: client fetches from API successfully

**Functionality:**
- [ ] API endpoint works: `curl http://localhost:3000/resources/catalog`
- [ ] Returns paginated results
- [ ] Filters work correctly (test with query params)
- [ ] Client resolves correct URL based on environment

**Documentation:**
- [ ] Swagger documentation generated
- [ ] All endpoints documented with examples

**Code Quality:**
- [ ] Linting passes on both server and client

#### Critical Files

**Server:**
- **CREATE**: `/src/asset-catalog/asset-catalog.controller.ts`
- **CREATE**: `/src/asset-catalog/asset-catalog.module.ts`
- **MODIFY**: `/src/resource/resource.controller.ts`
- **MODIFY**: `/src/app.module.ts`
- **CREATE**: `/src/asset-catalog/__tests__/asset-catalog.controller.spec.ts`

**Client:**
- **CREATE**: `/web_core/src/api/assetCatalog.ts`
- **CREATE**: `/web_core/src/resources/AssetUrlResolver.ts`
- **MODIFY**: `/web_core/src/resources/ResourceStorageAPI.ts`
- **MODIFY**: `/web_core/.env.example`
- **CREATE**: `/web_core/src/api/__tests__/assetCatalog.test.ts`
- **CREATE**: `/web_core/src/resources/__tests__/AssetUrlResolver.test.ts`

#### Rollback Plan

1. Disable AssetCatalogModule in AppModule
2. Revert ResourceController changes
3. Client falls back to legacy `/resources/models` endpoint

---

### Phase 5: Avatar Asset System & Client Rendering ⏱️ 2-3 hours

**Goal**: Integrate asset catalog with avatar system and SceneBuilder

#### Tasks

**RED (Write Tests First):**
- [ ] Write test: should resolve asset ID to URL
- [ ] Write test: should fallback to modelUrl if no asset ID
- [ ] Write test: should handle missing asset gracefully
- [ ] Write test: should preload common assets on init
- [ ] Write test: should cache asset blobs in LRU cache
- [ ] Write test: should load model from asset metadata
- [ ] Run tests to confirm failures

**GREEN (Implement):**

**Server:**
- [ ] Update AvatarConfig DTO: `src/avatar/dto/update-avatar.dto.ts`
  - Add `modelAssetId` field (optional)
  - Keep `modelUrl` for backward compatibility
- [ ] Update AvatarService: `src/avatar/avatar.service.ts`
  - Resolve asset ID to URL via AssetCatalogService
  - Fallback to modelUrl if no asset ID

**Client:**
- [ ] Create AssetPreloader: `web_core/src/resources/AssetPreloader.ts`
  - Preload common assets on app init
  - LRU cache for asset blobs (50 max)
- [ ] Update SceneBuilder: `web_core/src/scene/SceneBuilder.ts`
  - Accept asset metadata with model URL
  - Cache resolved URLs
  - Enhanced fallback: Asset ID → Asset URL → modelUrl → Default sphere
- [ ] Update CharacterEditor: `web_core/src/editors/EditMyAnimal.ts`
  - Show asset catalog in UI (basic list)
  - Filter by category/tags
  - Preview thumbnails
- [ ] Run tests to confirm passing

**REFACTOR:**
- [ ] Extract URL resolution logic to utility
- [ ] Simplify preloader cache eviction logic
- [ ] Add error boundaries in character editor
- [ ] Run tests after refactoring

#### Quality Gate Checklist

**Build & Compilation:**
- [ ] Server builds: `npm run build`
- [ ] Client builds: `cd ../web_core && npm run build`

**TDD Compliance:**
- [ ] Tests written first
- [ ] Red-green-refactor followed

**Testing:**
- [ ] Server tests pass: `npm test avatar.service`
- [ ] Client tests pass: `npm test AssetPreloader SceneBuilder`
- [ ] Test coverage ≥80%

**Functionality:**
- [ ] Create avatar with asset ID via API
- [ ] Avatar loads in client using asset catalog
- [ ] Fallback to modelUrl works for old avatars
- [ ] Asset preloading reduces load time (measure with console.time)
- [ ] No breaking changes to existing avatars

**Performance:**
- [ ] Asset load time < 2 seconds
- [ ] Preloading improves second load by 30%+

**Code Quality:**
- [ ] Linting passes
- [ ] No console.log (use proper logging)

#### Critical Files

**Server:**
- **MODIFY**: `/src/avatar/dto/update-avatar.dto.ts`
- **MODIFY**: `/src/avatar/avatar.service.ts`
- **MODIFY**: `/src/avatar/__tests__/avatar.service.spec.ts`

**Client:**
- **CREATE**: `/web_core/src/resources/AssetPreloader.ts`
- **MODIFY**: `/web_core/src/scene/SceneBuilder.ts`
- **MODIFY**: `/web_core/src/editors/EditMyAnimal.ts`
- **CREATE**: `/web_core/src/resources/__tests__/AssetPreloader.test.ts`

#### Rollback Plan

1. Remove `modelAssetId` field from DTO
2. Revert AvatarService to use `modelUrl` only
3. Disable asset preloading
4. Revert SceneBuilder changes

---

### Phase 6: Asset Versioning, CDN & Optimization ⏱️ 3-4 hours

**Goal**: Production-ready asset management with versioning and CDN

#### Tasks

**RED (Write Tests First):**
- [ ] Write test: should create new version of asset
- [ ] Write test: should mark old version as deprecated
- [ ] Write test: should list versions for asset
- [ ] Write test: should generate CloudFront URLs
- [ ] Write test: should compress GLB file
- [ ] Write test: should generate thumbnail
- [ ] Run tests to confirm failures

**GREEN (Implement):**

**Versioning:**
- [ ] Create AssetVersioningService: `src/asset-catalog/asset-versioning.service.ts`
  - Semantic versioning (1.0.0, 1.1.0, 2.0.0)
  - Create new version via `POST /resources/catalog/:id/version`
  - Deprecation workflow
  - Version listing and comparison

**CDN Integration:**
- [ ] Create CDNUrlGenerator: `src/resource/cdn-url-generator.ts`
  - Generate CloudFront URLs
  - Cache-Control headers (max-age=31536000)
  - Signed URLs for private assets
- [ ] Update S3Service: add CDN URL support
- [ ] Add CDN config: `src/config/cdn.config.ts`
- [ ] Update `.env.example` with CDN variables

**Optimization:**
- [ ] Create AssetOptimizerService: `src/resource/asset-optimizer.service.ts`
  - GLB optimization (compress, remove unused data)
  - Thumbnail generation (256x256 PNG)
  - Optimization status tracking

**Migration:**
- [ ] Create migration script: `scripts/migrate-assets-to-catalog.ts`
  - Scan existing `models/` folder in S3
  - Create catalog entries for all GLB files
  - Update user avatars with asset IDs
- [ ] Run tests to confirm passing

**REFACTOR:**
- [ ] Extract version comparison logic to utility
- [ ] Simplify CDN fallback logic
- [ ] Add comprehensive logging for migrations
- [ ] Run tests after refactoring

#### Quality Gate Checklist

**Build & Compilation:**
- [ ] Project builds: `npm run build`

**TDD Compliance:**
- [ ] Tests written first
- [ ] Red-green-refactor followed

**Testing:**
- [ ] All tests pass: `npm test asset-versioning cdn-url-generator asset-optimizer`
- [ ] Test coverage ≥85%

**Functionality:**
- [ ] Create new asset version via API
- [ ] Old version marked as deprecated
- [ ] CDN URLs generated correctly
- [ ] Migration script runs without errors
- [ ] All existing models migrated to catalog

**Performance:**
- [ ] CDN cache hit rate > 95% (simulate with test requests)
- [ ] Asset load time reduced by 50% (CDN vs S3 direct)

**Security:**
- [ ] Presigned URLs still work with CDN
- [ ] Private assets require authentication

**Code Quality:**
- [ ] Linting passes
- [ ] Migration script has dry-run mode

#### Critical Files

- **CREATE**: `/src/asset-catalog/asset-versioning.service.ts`
- **CREATE**: `/src/resource/cdn-url-generator.ts`
- **CREATE**: `/src/resource/asset-optimizer.service.ts`
- **MODIFY**: `/src/resource/s3.service.ts`
- **CREATE**: `/scripts/migrate-assets-to-catalog.ts`
- **CREATE**: `/src/config/cdn.config.ts`
- **MODIFY**: `/.env.example`
- **CREATE**: `/src/asset-catalog/__tests__/asset-versioning.service.spec.ts`
- **CREATE**: `/src/resource/__tests__/cdn-url-generator.spec.ts`
- **CREATE**: `/src/resource/__tests__/asset-optimizer.spec.ts`

#### Rollback Plan

1. Disable CDN URLs, use S3 presigned URLs
2. Keep versioning service (no impact if unused)
3. Revert migration if issues occur (backup database first)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| S3 path changes break existing URLs | Medium | High | Keep legacy paths, add redirects |
| Database migration failures | Low | High | Test on staging, backup before migration |
| Client-server API mismatch | Medium | Medium | Versioned APIs, feature flags |
| CDN misconfiguration | Low | Medium | Fallback to S3 URLs |
| Asset upload pipeline failures | Low | Medium | Atomic transactions, rollback logic |
| Performance degradation | Low | Medium | Load testing, caching layers |

---

## Overall Quality Standards

**Code Coverage Targets:**
- Services: ≥85%
- Controllers: ≥80%
- Validators: ≥95%
- Utilities: ≥90%

**Performance Targets:**
- API response time: p95 < 500ms
- Asset load time: < 2 seconds
- CDN cache hit rate: > 95%
- Asset upload success rate: > 99%

**Security Requirements:**
- All asset upload endpoints require authentication
- Admin-only endpoints for catalog mutations
- Presigned URLs expire after configured time
- CORS properly configured for asset URLs

---

## Migration Strategy for Existing Data

### Backward Compatibility:
1. **Phases 1-3**: `modelUrl` continues to work
2. **Phase 4**: `modelAssetId` field added (optional)
3. **Phase 5**: AvatarService supports both fields
4. **Phase 6**: Migration script populates `modelAssetId`
5. **Post-launch**: Deprecate `modelUrl` after 6 months

### Data Migration SQL:
```sql
-- Backfill asset IDs for existing avatars
UPDATE users
SET avatarCustomization = jsonb_set(
  avatarCustomization,
  '{modelAssetId}',
  (SELECT to_jsonb(id) FROM asset_catalog
   WHERE key = avatarCustomization->>'modelUrl')
)
WHERE avatarCustomization->>'modelUrl' IS NOT NULL
  AND avatarCustomization->>'modelAssetId' IS NULL;
```

---

## Progress Tracking

**Last Updated**: 2025-12-27

### Phase Completion Status:
- [x] Phase 1: Asset Catalog & Database Foundation ✅ **COMPLETED**
- [ ] Phase 2: Enhanced S3 Service & Asset Organization
- [ ] Phase 3: MinIO Docker Setup for Local Development
- [ ] Phase 4: Asset Catalog API & Client Integration
- [ ] Phase 5: Avatar Asset System & Client Rendering
- [ ] Phase 6: Asset Versioning, CDN & Optimization

---

## Notes & Learnings

### Phase 1 Notes:
**Completed**: 2025-12-27

**Key Achievements:**
- Fixed Jest configuration issues (Jest 30.x → 29.x for Node 18.1.0 compatibility)
- Implemented TDD workflow successfully (RED-GREEN-REFACTOR)
- Achieved 95.96% test coverage (exceeds 90% target)
- All 12 tests passing with comprehensive coverage
- Database migration executed successfully
- Proper TypeScript typing with Kysely

**Technical Challenges Solved:**
1. **Jest Configuration**: ES module project required special handling
   - Downgraded to Jest 29.x for better compatibility
   - Configured ts-jest with CommonJS transform
   - Fixed `__dirname` issue in migrate.ts using `import.meta.url`

2. **Mock Setup**: DatabaseService uses `db` property, not `getDb()` method
   - Updated all tests to use direct property access
   - Added missing mock methods (`returningAll`, `selectAll`)

3. **Type Safety**: Refactored `updateData` from `any` to explicit types
   - Improved code quality and reduced linting errors
   - Maintained compatibility with Kysely's type system

**Files Created:**
- `src/database/migrations/002_asset_catalog.ts`
- `src/database/schema/asset-catalog.ts`
- `src/asset-catalog/asset-catalog.service.ts`
- `src/asset-catalog/dto/asset-catalog.dto.ts`
- `src/asset-catalog/__tests__/asset-catalog.service.spec.ts`

**Quality Metrics:**
- Build: ✅ Passed
- Tests: ✅ 12/12 passing
- Coverage: ✅ 95.96% statements
- Linting: ✅ Passed
- Migration: ✅ Executed successfully

### Phase 2 Notes:
_To be filled during implementation_

### Phase 3 Notes:
_To be filled during implementation_

### Phase 4 Notes:
_To be filled during implementation_

### Phase 5 Notes:
_To be filled during implementation_

### Phase 6 Notes:
_To be filled during implementation_

---

## Post-Implementation Enhancements (Future)

These are potential future phases beyond the current scope:

- **Asset Bundles**: Package multiple assets together
- **Asset Marketplace**: User-uploaded assets with review workflow
- **Real-time Collaboration**: Multiple users editing avatars simultaneously
- **Asset Analytics**: Track usage, popularity, performance
- **Advanced Optimization**: WebP/AVIF thumbnails, progressive loading, HTTP/3
- **Service Worker**: Offline asset access and caching
