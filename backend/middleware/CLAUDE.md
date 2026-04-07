# Middleware — Claude Context

> File duy nhất: `middleware/auth.js`
> Chứa 2 middleware functions được dùng để bảo vệ routes.

## Middleware: `protect`

**Chức năng**: Verify JWT token, attach `req.user`, kiểm tra user bị block.

```js
// Cách dùng trong route file
const { protect, adminOnly } = require('../middleware/auth');

router.get('/profile', protect, authController.getMe);
```

**Logic flow**:
```
1. Lấy token từ header: Authorization: Bearer <token>
2. Nếu không có token → 401 "Vui lòng đăng nhập"
3. jwt.verify(token, JWT_SECRET) → decode payload { id, role }
4. User.findById(id) → attach vào req.user
5. Nếu user.isBlocked === true → 403 "Tài khoản bị khóa" (admin exempt)
6. next() → controller tiếp theo
```

**Error responses**:
| Tình huống | Status | Message |
|-----------|--------|---------|
| Không có token | 401 | "Vui lòng đăng nhập" |
| Token hết hạn | 401 | "Token hết hạn, vui lòng đăng nhập lại" |
| Token không hợp lệ | 401 | "Token không hợp lệ" |
| User bị block | 403 | "Tài khoản của bạn đã bị khóa" |
| User không tồn tại | 401 | "Người dùng không tồn tại" |

## Middleware: `adminOnly`

**Chức năng**: Kiểm tra `req.user.role === 'admin'`. Luôn đứng **sau** `protect`.

```js
// Pattern đúng — adminOnly sau protect
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

// Pattern SAI — không có protect trước
router.delete('/:id', adminOnly, productController.deleteProduct); // ❌
```

**Logic**:
```js
if (req.user.role !== 'admin') {
  return res.status(403).json({ success: false, message: 'Không đủ quyền admin' });
}
next();
```

## Middleware: `upload` (Multer)

**Chức năng**: Parse `multipart/form-data`, stream file lên Cloudinary.

```js
// Trong route file (cần import từ config)
const { upload } = require('../config/cloudinary');

router.post('/', protect, adminOnly, upload.single('image'), productController.create);
```

**Lưu ý**:
- `upload.single('image')` — field name phải là `image`
- File được upload thẳng lên Cloudinary, không lưu disk local
- `req.file.path` chứa Cloudinary URL sau khi upload thành công
- Size limit: cấu hình trong `config/cloudinary.js`

## Pattern Khi Áp Dụng Middleware Cho Groups

```js
// Tất cả routes trong file đều cần protect + adminOnly
router.use(protect, adminOnly);

router.get('/', controller.getAll);
router.post('/', controller.create);
// ...

// Hoặc áp dụng từng route (cho mixed auth requirements)
router.get('/', controller.getPublic);            // public
router.post('/', protect, adminOnly, controller.create); // admin only
```
