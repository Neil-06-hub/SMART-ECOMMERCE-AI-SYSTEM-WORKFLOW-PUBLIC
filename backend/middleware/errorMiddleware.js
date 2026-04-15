const errorHandler = (err, req, res, next) => {
  // JSON parse error từ body-parser (malformed request body) — chỉ log 1 dòng, không in stack
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ success: false, message: "Request body không hợp lệ (JSON bị lỗi)" });
  }

  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

module.exports = { errorHandler };
