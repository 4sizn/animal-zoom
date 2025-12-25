var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service.js';
import { ResourceController } from './resource.controller.js';
import { S3Service } from './s3.service.js';
import { DatabaseModule } from '../database/database.module.js';
let ResourceModule = class ResourceModule {
};
ResourceModule = __decorate([
    Module({
        imports: [DatabaseModule],
        providers: [ResourceService, S3Service],
        controllers: [ResourceController],
        exports: [ResourceService],
    })
], ResourceModule);
export { ResourceModule };
//# sourceMappingURL=resource.module.js.map