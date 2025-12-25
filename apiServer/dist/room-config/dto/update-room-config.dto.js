"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoomConfigDto = exports.LightingPreset = void 0;
const class_validator_1 = require("class-validator");
var LightingPreset;
(function (LightingPreset) {
    LightingPreset["DEFAULT"] = "default";
    LightingPreset["BRIGHT"] = "bright";
    LightingPreset["DIM"] = "dim";
    LightingPreset["WARM"] = "warm";
    LightingPreset["COOL"] = "cool";
    LightingPreset["DRAMATIC"] = "dramatic";
})(LightingPreset || (exports.LightingPreset = LightingPreset = {}));
class UpdateRoomConfigDto {
    lightingPreset;
    floorColor;
    wallColor;
    furniture;
    decorations;
}
exports.UpdateRoomConfigDto = UpdateRoomConfigDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(LightingPreset),
    __metadata("design:type", String)
], UpdateRoomConfigDto.prototype, "lightingPreset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, {
        message: 'Floor color must be a valid hex color (e.g., #8B4513)',
    }),
    __metadata("design:type", String)
], UpdateRoomConfigDto.prototype, "floorColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, {
        message: 'Wall color must be a valid hex color (e.g., #ffffff)',
    }),
    __metadata("design:type", String)
], UpdateRoomConfigDto.prototype, "wallColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateRoomConfigDto.prototype, "furniture", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateRoomConfigDto.prototype, "decorations", void 0);
//# sourceMappingURL=update-room-config.dto.js.map