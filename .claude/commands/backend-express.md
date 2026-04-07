---
description: Scaffold Express.js modules, generate endpoints, create DTOs, repositories, and services for the SMART-ECOMMERCE API following the project's exact naming conventions, import alias patterns, and architectural constraints.
---

# Express.js Backend Specialist

## When to Use This Skill
- "Scaffold the `[module]` module"
- "Generate a new endpoint for `[module]`"
- "Add a repository method to `[resource]`"
- "Create a DTO for `[operation]`"
- Any task writing to `apps/api/src/modules/`

## Context to Read First (in order)
1. `docs/MODULE_STRUCTURE.md` §2 (standard module template) + §7 (naming conventions) + §4.x (specific target module detail)
2. `docs/DATABASE_DESIGN.md` §3.x (relevant collection schema + indexes)
3. `libs/shared/src/constants/error-codes.ts` (error codes for the module domain)
4. `libs/shared/src/constants/redis-keys.ts` (if Redis is used in this module)
5. `apps/api/src/shared/database/base.repository.ts` (before writing any repository)
6. `apps/api/src/modules/auth/` (reference example for patterns — read one .service.ts and one .controller.ts)

## File Generation Order (dependency order — never reverse)
```
schemas/          → @Schema() first, no dependencies
interfaces/       → pure TypeScript types
repositories/     → depends on schema + BaseRepository
services/         → depends on repository + RedisService
controllers/      → depends on service + guards
*.module.ts       → wires all providers/imports
dto/              → parallel, any time
```

## Output Requirements Per File Type

### `schemas/[resource].schema.ts`
```typescript
import { Prop, Schema, SchemaFactory } from '@express/mongoose';
import { Document, Types } from 'mongoose';

export type [Resource]Document = [Resource] & Document;

@Schema({ timestamps: true, collection: '[collection_name]' })
export class [Resource] {
  @Prop({ required: true })
  fieldName: string;

  // Money fields: always Number (integer VND), never Decimal128 or string
  @Prop({ required: true, min: 0 })
  price: number;

  // Soft-delete: ALL collections except audit_logs, error_logs, behavioral_events, model_versions, feature_snapshots
  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const [Resource]Schema = SchemaFactory.createForClass([Resource]);

// Declare compound indexes here (not in @Prop decorators)
[Resource]Schema.index({ deletedAt: 1, status: 1 });
```

**Schema rules:**
- `timestamps: true` always — adds `createdAt` and `updatedAt` automatically
- `deletedAt: Date | null = null` on ALL non-append-only collections
- `_id` is MongoDB ObjectId auto-generated — never set manually, never UUID
- Money fields: `Number` (VND integer) — no decimals, no strings, no Decimal128
- Embedded sub-documents use separate `@Schema()` classes with `_id: false`
- Collection name: `lowercase_plural` (e.g., `behavioral_events`, `push_subscriptions`)

### `interfaces/[resource].interface.ts`
```typescript
// Pure TypeScript only — NO Express.js, NO Mongoose imports
export interface [Resource]Data {
  id: string;  // ObjectId serialized as string
  fieldName: string;
}

export enum [Resource]Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
```

### `repositories/[resource].repository.ts`
```typescript
import { Injectable } from '@express/common';
import { InjectModel } from '@express/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@shared/database/base.repository';
import { [Resource], [Resource]Document } from '../schemas/[resource].schema';

@Injectable()
export class [Resource]Repository extends BaseRepository<[Resource]Document> {
  constructor(
    @InjectModel([Resource].name) private readonly [resource]Model: Model<[Resource]Document>,
  ) {
    super([resource]Model);
  }

  // ALWAYS include { deletedAt: null } in base queries
  async findByField(value: string): Promise<[Resource]Document | null> {
    return this.[resource]Model
      .findOne({ fieldName: value, deletedAt: null })
      .lean()         // .lean() for read-only queries (no Mongoose document overhead)
      .exec();
  }

  // For paginated queries: use BaseRepository.paginate()
  // Never expose the raw Model — all queries go through repository methods
}
```

**Repository rules:**
- `extends BaseRepository<T>` always
- Every query includes `{ deletedAt: null }` — BaseRepository may add this automatically, but explicit is better
- Use `.lean()` for read-only queries
- Never expose `this.[resource]Model` publicly — it's private
- `insertMany()` for batch inserts, never loop with `save()`

### `services/[resource].service.ts`
```typescript
import { Injectable, NotFoundException } from '@express/common';
import { [Resource]Repository } from '../repositories/[resource].repository';
import { RedisService } from '@shared/redis/redis.service';
import { ErrorCodes } from '@lib/constants/error-codes';
import { PRODUCT_CACHE_KEY } from '@lib/constants/redis-keys';  // use template functions

@Injectable()
export class [Resource]Service {
  constructor(
    private readonly [resource]Repository: [Resource]Repository,
    private readonly redisService: RedisService,  // only if Redis is used
  ) {}

  async findById(id: string): Promise<[Resource]Document> {
    // Use getOrSet() for cacheable queries — NEVER raw get() + set()
    return this.redisService.getOrSet(
      PRODUCT_CACHE_KEY(id),
      300,  // TTL in seconds
      () => this.[resource]Repository.findById(id),
    );
  }

  async findOrThrow(id: string): Promise<[Resource]Document> {
    const item = await this.[resource]Repository.findById(id);
    if (!item) {
      // Error codes from constants — NEVER raw strings like 'Product not found'
      throw new NotFoundException(ErrorCodes.PRODUCT_NOT_FOUND);
    }
    return item;
  }
}
```

**Service rules:**
- Inject Repository, not the Mongoose Model directly
- Always use `ErrorCodes.[CONSTANT]` from `@lib/constants/error-codes` — never raw strings
- Use `RedisService.getOrSet()` for caching — never `redis.get()` + `redis.set()` separately
- Never call Redis inside a loop — use MGET pattern for batch lookups
- Cross-module communication via EventEmitter2 `emit()` — never inject another module's service

### `controllers/[resource].controller.ts`
```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@express/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@express/swagger';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { Role } from '@lib/types/role.enum';

@ApiTags('[resource]')
@Controller('api/v1/[resource]')
export class [Resource]Controller {
  constructor(private readonly [resource]Service: [Resource]Service) {}

  @Get()
  // Public endpoints: no @UseGuards
  async findAll(@Query() query: [Resource]QueryDto) {
    // Controllers have NO business logic — delegate everything to service
    return this.[resource]Service.findAll(query);
    // ResponseInterceptor wraps the return value in { success: true, data: ... }
    // NEVER manually return { success: true, data: result } from controllers
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: Create[Resource]Dto,
    @CurrentUser() user: JwtPayload,  // userId from JWT, NEVER from request body
  ) {
    return this.[resource]Service.create(dto, user.sub);
  }
}
```

**Controller rules:**
- No business logic in controllers — all if/else goes in service
- `@UseGuards(JwtAuthGuard, RolesGuard)` on every non-public endpoint
- `userId` always from `@CurrentUser()` decorator — never `req.body.userId`
- Controllers return raw data — `ResponseInterceptor` handles envelope wrapping
- `@HttpCode(HttpStatus.CREATED)` for POST that creates resources

### `[module].module.ts`
```typescript
import { Module } from '@express/common';
import { MongooseModule } from '@express/mongoose';
import { [Resource], [Resource]Schema } from './schemas/[resource].schema';
import { [Resource]Repository } from './repositories/[resource].repository';
import { [Resource]Service } from './services/[resource].service';
import { [Resource]Controller } from './controllers/[resource].controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: [Resource].name, schema: [Resource]Schema }]),
    // Only import modules that are in the APPROVED dependency list in MODULE_STRUCTURE.md §3
    // SharedModule is @Global() — DO NOT import it here
  ],
  providers: [[Resource]Repository, [Resource]Service],
  controllers: [[Resource]Controller],
  exports: [[Resource]Service],  // only export what other modules legitimately need
})
export class [Resource]Module {}
```

### `dto/create-[resource].dto.ts`
```typescript
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@express/swagger';
import { PartialType } from '@express/mapped-types';

export class Create[Resource]Dto {
  @ApiProperty({ description: 'Field description', example: 'example value' })
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @ApiProperty({ description: 'Price in VND (integer)', example: 150000 })
  @IsNumber()
  @Min(0)
  price: number;  // integer VND, never decimal
}

// Update DTO: use PartialType to make all fields optional
export class Update[Resource]Dto extends PartialType(Create[Resource]Dto) {}
```

## Naming Conventions (strictly follow MODULE_STRUCTURE.md §7)

| Element | Convention | Example |
|---|---|---|
| File | `kebab-case.{type}.ts` | `user-profile.service.ts` |
| Class | `PascalCase` | `UserProfileService` |
| Interface | `PascalCase` (no `I` prefix) | `JwtPayload` not `IJwtPayload` |
| DTO | `PascalCase` + `Dto` suffix | `CreateProductDto` |
| Schema | `PascalCase` + `Document` | `UserDocument` |
| Enum | `PascalCase` name, `SCREAMING_SNAKE_CASE` values | `enum OrderStatus { PENDING_PAYMENT }` |
| Constant | `SCREAMING_SNAKE_CASE` | `EMAIL_QUEUE`, `MAX_RETRY_COUNT` |
| MongoDB field | `camelCase` | `createdAt`, `passwordHash` |
| MongoDB collection | `lowercase_plural` | `users`, `behavioral_events` |
| URL path | `kebab-case`, plural noun | `/api/v1/products` |

## Import Alias Rules (NEVER use relative paths crossing module boundaries)
```typescript
// CORRECT — always use aliases
import { ProductService }   from '@modules/catalog/services/product.service';
import { JwtAuthGuard }     from '@shared/guards/jwt-auth.guard';
import { RedisService }     from '@shared/redis/redis.service';
import { paginateQuery }    from '@shared/utils/paginate.util';
import { JwtConfig }        from '@config/jwt.config';
import type { ApiResponse } from '@lib/types/api-response.type';
import { Role }             from '@lib/types/role.enum';
import { EMAIL_QUEUE }      from '@lib/constants/queue-names';
import { AUTH_TOKEN_EXPIRED } from '@lib/constants/error-codes';
import { SESSION_KEY }      from '@lib/constants/redis-keys';

// WRONG — never relative paths crossing boundaries
import { ProductService } from '../../catalog/services/product.service';
import { JwtAuthGuard }   from '../../../shared/guards/jwt-auth.guard';
```

## Module Import Matrix (approved dependencies only)
| Module | May Import |
|---|---|
| AuthModule | SharedModule |
| CatalogModule | SharedModule |
| CartModule | SharedModule, CatalogModule |
| OrderModule | SharedModule, CartModule |
| PaymentModule | SharedModule, OrderModule |
| RecommendationModule | SharedModule, CatalogModule |
| MarketingModule | SharedModule, NotificationModule |
| NotificationModule | SharedModule |
| AnalyticsModule | SharedModule |

**SharedModule is `@Global()` — never add it to `imports[]` in feature modules.**

## Self-Healing Checklist

After generating any file, run in order:

1. **`cd apps/api && npx tsc --noEmit`**
   - Import path errors → replace with correct alias (`@modules/`, `@shared/`, `@lib/`)
   - Missing type → check if interface file needs to be imported
   - Property doesn't exist → verify schema field names match

2. **`npm run lint -- --fix`**
   - Most lint issues auto-fix
   - Remaining: check for unused imports, missing decorators

3. **Common auto-fixes:**
   - `../../shared/...` → `@shared/...`
   - `throw new NotFoundException('not found')` → `throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND)`
   - `this.[resource]Model.findOne(...)` in service → move to repository method
   - `return { success: true, data: result }` in controller → `return result`
   - Missing `{ deletedAt: null }` in repository query → add it
   - `bcrypt` cost < 12 → raise to 12

## Final Checklist Before Done
- [ ] All import paths use aliases (`@modules/*`, `@shared/*`, `@lib/*`)
- [ ] All queries include `{ deletedAt: null }`
- [ ] All money fields are `Number` (integer VND)
- [ ] All error throws use `ErrorCodes.*` constants
- [ ] Controllers return raw data (no manual envelope wrapping)
- [ ] Module `imports[]` matches approved dependency matrix
- [ ] `tsc --noEmit` → 0 errors
- [ ] `npm run lint` → 0 warnings
