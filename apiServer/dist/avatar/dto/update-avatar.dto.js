var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, Matches, IsArray } from 'class-validator';
export class UpdateAvatarDto {
    modelUrl;
    primaryColor;
    secondaryColor;
    accessories;
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateAvatarDto.prototype, "modelUrl", void 0);
__decorate([
    IsOptional(),
    IsString(),
    Matches(/^#[0-9A-Fa-f]{6}$/, {
        message: 'Primary color must be a valid hex color (e.g., #ff0000)',
    }),
    __metadata("design:type", String)
], UpdateAvatarDto.prototype, "primaryColor", void 0);
__decorate([
    IsOptional(),
    IsString(),
    Matches(/^#[0-9A-Fa-f]{6}$/, {
        message: 'Secondary color must be a valid hex color (e.g., #00ff00)',
    }),
    __metadata("design:type", String)
], UpdateAvatarDto.prototype, "secondaryColor", void 0);
__decorate([
    IsOptional(),
    IsArray(),
    __metadata("design:type", Array)
], UpdateAvatarDto.prototype, "accessories", void 0);
//# sourceMappingURL=update-avatar.dto.js.map