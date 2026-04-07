---
description: Generate Jest unit tests, Express.js e2e specs, and pytest tests for FastAPI following this project's testing patterns. Covers happy paths, error cases with error code assertions, and soft-delete verification.
---

# Test Engineer

## When to Use This Skill
- After writing any service or repository
- "Write tests for `[module/service]`"
- "Add e2e test for `[endpoint]`"
- "Write pytest for `[FastAPI route]`"
- When CI pipeline fails with missing coverage
- As step 6 in the standard feature development workflow

## Context to Read First (in order)
1. The implementation file being tested (read it first — never test blindly)
2. `docs/MODULE_STRUCTURE.md` §4.x (relevant module, to understand what to test)
3. `docs/API_SPECIFICATIONS.md` §3.x (for e2e test case derivation: valid requests, error cases)
4. `libs/shared/src/constants/error-codes.ts` (expected error codes in failure tests)
5. An existing test file as a pattern reference (once scaffolded)

---

## Jest Unit Test — Express.js Service

**Location:** `apps/api/src/modules/{module}/{module}.service.spec.ts`  
**Location:** `apps/api/src/modules/{module}/repositories/{resource}.repository.spec.ts`

```typescript
import { Test, TestingModule } from '@express/testing';
import { NotFoundException } from '@express/common';
import { getModelToken } from '@express/mongoose';
import { EventEmitter2 } from '@express/event-emitter';
import { [Resource]Service } from './[resource].service';
import { [Resource]Repository } from './repositories/[resource].repository';
import { RedisService } from '@shared/redis/redis.service';
import { ErrorCodes } from '@lib/constants/error-codes';

describe('[Resource]Service', () => {
  let service: [Resource]Service;
  let repository: jest.Mocked<[Resource]Repository>;
  let redisService: jest.Mocked<RedisService>;

  const mockItem = {
    _id: '64a7b2c3d4e5f6a7b8c9d0e1',
    name: 'Test Item',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [Resource]Service,
        {
          provide: [Resource]Repository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            getOrSet: jest.fn((key, ttl, factory) => factory()),  // passthrough by default
            del: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<[Resource]Service>([Resource]Service);
    repository = module.get([Resource]Repository);
    redisService = module.get(RedisService);
  });

  afterEach(() => jest.clearAllMocks());

  // HAPPY PATH
  describe('findById', () => {
    it('should return item when found', async () => {
      repository.findById.mockResolvedValue(mockItem as any);

      const result = await service.findById(mockItem._id);

      expect(result).toEqual(mockItem);
      expect(repository.findById).toHaveBeenCalledWith(mockItem._id);
    });

    // NOT FOUND
    it('should throw NotFoundException with correct error code when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent'))
        .rejects
        .toThrow(NotFoundException);

      // CRITICAL: always verify the error code constant, not just HTTP status
      await expect(service.findById('nonexistent'))
        .rejects
        .toMatchObject({ message: ErrorCodes.RESOURCE_NOT_FOUND });
    });
  });

  // CONFLICT
  describe('create', () => {
    it('should create item successfully', async () => {
      repository.create.mockResolvedValue(mockItem as any);
      const dto = { name: 'New Item', price: 100000 };

      const result = await service.create(dto);

      expect(result).toEqual(mockItem);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException with correct error code on duplicate', async () => {
      repository.create.mockRejectedValue({ code: 11000 });  // MongoDB duplicate key

      await expect(service.create({ name: 'Duplicate' }))
        .rejects
        .toMatchObject({ message: ErrorCodes.RESOURCE_ALREADY_EXISTS });
    });
  });
});
```

### Repository Unit Test Pattern

```typescript
describe('[Resource]Repository', () => {
  let repository: [Resource]Repository;
  let model: jest.Mocked<Model<[Resource]Document>>;

  // CRITICAL: verify { deletedAt: null } is in every query
  it('should always include deletedAt filter in findById', async () => {
    const mockExec = jest.fn().mockResolvedValue(mockItem);
    jest.spyOn(model, 'findOne').mockReturnValue({ lean: () => ({ exec: mockExec }) } as any);

    await repository.findById('some-id');

    expect(model.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: null })
    );
  });

  // Verify pagination
  it('should apply skip and limit for pagination', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    } as any);

    await repository.findAll({ page: 2, limit: 10 });

    expect(model.find).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: null })
    );
  });
});
```

---

## Jest E2E Test — Express.js Endpoints

**Location:** `apps/api/test/{module}.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@express/testing';
import { INestApplication, ValidationPipe } from '@express/common';
import * as request from 'supertest';
import { MongooseModule } from '@express/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ErrorCodes } from '@lib/constants/error-codes';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    // Use in-memory MongoDB — no real Atlas connection in tests
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        // import feature modules here
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    // Seed test data
  });

  afterEach(async () => {
    // Clean up collections
    const connection = app.get(getConnectionToken());
    await Promise.all(
      Object.values(connection.collections).map(col => col.deleteMany({}))
    );
  });

  describe('POST /api/v1/auth/register', () => {
    const validPayload = {
      email: 'test@example.com',
      password: 'Test@1234',
      fullName: 'Test User',
    };

    it('should register successfully with valid payload → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validPayload)
        .expect(201);

      // Verify standard envelope
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('email', validPayload.email);
      // passwordHash must NEVER appear in response
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    it('should return 409 with AUTH_EMAIL_EXISTS on duplicate email', async () => {
      // Register once
      await request(app.getHttpServer()).post('/api/v1/auth/register').send(validPayload);

      // Register again with same email
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validPayload)
        .expect(409);

      expect(res.body.success).toBe(false);
      // CRITICAL: verify exact error code, not just HTTP status
      expect(res.body.error.code).toBe(ErrorCodes.AUTH_EMAIL_EXISTS);
    });

    it('should return 422 with VALIDATION_ERROR for invalid password format', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validPayload, password: 'weak' })
        .expect(422);

      expect(res.body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should return 422 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({})
        .expect(422);
    });
  });
});
```

---

## Pytest — FastAPI AI Service

**Location:** `apps/ai-service/tests/test_{module}.py`

```python
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import fakeredis
import numpy as np

from app.main import app


@pytest.fixture
def client():
    """TestClient with no real external dependencies."""
    return TestClient(app)


@pytest.fixture
def mock_cf_model():
    """Mock LightFM model — no real training data needed."""
    model = MagicMock()
    model.predict.return_value = np.array([0.8, 0.6, 0.4, 0.9])  # fake scores
    return model


@pytest.fixture
def fake_redis():
    """fakeredis instance — no real Upstash connection in tests."""
    return fakeredis.FakeRedis()


class TestRecommendEndpoint:
    def test_recommend_success(self, client, mock_cf_model, fake_redis):
        """Should return 200 + product IDs array for valid userId."""
        with patch('app.services.cf_service.cf_model', mock_cf_model), \
             patch('app.services.cf_service.redis_client', fake_redis):

            response = client.post('/recommend', json={
                'user_id': 'user123',
                'placement': 'homepage',
                'n': 5,
            })

        assert response.status_code == 200
        data = response.json()
        assert 'product_ids' in data
        assert 'scores' in data
        assert 'model_version' in data
        assert 'source' in data
        assert data['source'] in ['model_lightfm', 'fallback_popular']

    def test_recommend_fallback_when_model_fails(self, client, fake_redis):
        """Should return 200 + popularity fallback when model raises exception."""
        with patch('app.services.cf_service.cf_model', side_effect=Exception('Model error')), \
             patch('app.services.cf_service.redis_client', fake_redis):

            response = client.post('/recommend', json={
                'user_id': 'user123',
                'placement': 'homepage',
                'n': 5,
            })

        assert response.status_code == 200
        assert response.json()['source'] == 'fallback_popular'

    def test_recommend_returns_cached_result(self, client, mock_cf_model, fake_redis):
        """Cache hit should return same result without calling model again."""
        # Pre-seed the cache
        fake_redis.setex('rec:user123:homepage', 600, '["prod1","prod2","prod3"]')

        with patch('app.services.cf_service.cf_model', mock_cf_model), \
             patch('app.services.cf_service.redis_client', fake_redis):

            response = client.post('/recommend', json={
                'user_id': 'user123', 'placement': 'homepage', 'n': 3
            })

        assert response.status_code == 200
        mock_cf_model.predict.assert_not_called()  # cache hit → no model call

    def test_reload_model_unauthorized(self, client):
        """Missing token → 401."""
        response = client.post('/internal/reload-model')
        assert response.status_code == 401

    def test_reload_model_success(self, client):
        """Valid token → 200."""
        with patch('app.routers.internal.reload_models_from_r2', return_value=True):
            response = client.post(
                '/internal/reload-model',
                headers={'X-Internal-Token': 'test-token'},
            )
        assert response.status_code == 200
```

---

## Test Coverage Requirements

| Layer | Target coverage | Focus |
|---|---|---|
| Services | > 80% | Happy path, not-found, conflict, business rule violations |
| Repositories | > 70% | `{ deletedAt: null }` filter, pagination, correct query filters |
| Controllers | > 60% | Delegation to service, guard behavior |
| FastAPI routes | > 75% | Success, fallback, cache hit/miss, auth |

---

## Testing Constraints (Non-Negotiable)

1. **Zero real network in unit tests** — mock all: MongoDB model, Redis, HTTP clients, EventEmitter2
2. **Error assertions check error code constants** — not just HTTP status
   ```typescript
   // WRONG:
   await expect(fn()).rejects.toThrow(NotFoundException);
   
   // CORRECT:
   await expect(fn()).rejects.toMatchObject({ message: ErrorCodes.PRODUCT_NOT_FOUND });
   ```
3. **`{ deletedAt: null }` must be verified** in repository tests — it's a critical correctness requirement
4. **Test files co-located**: `{resource}.service.spec.ts` next to `{resource}.service.ts`
5. **E2E tests use `mongodb-memory-server`** — never connect to real Atlas in CI
6. **Seed in `beforeEach`, clean in `afterEach`** — tests must be independent and idempotent

## Final Checklist Before Done
- [ ] Happy path tested
- [ ] Not-found case tested with correct `ErrorCodes.*` assertion
- [ ] Conflict/duplicate case tested (where applicable)
- [ ] Business rule violations tested (out of stock, invalid status transition)
- [ ] `{ deletedAt: null }` verified in repository tests
- [ ] All mocks use `jest.fn()` — no real network calls
- [ ] Tests are independent (no shared state between tests)
- [ ] `npm run test -- --testPathPattern={module}` → all passing
