FROM python:3.11-slim

WORKDIR /app

# 1. Cài đặt các công cụ biên dịch bắt buộc
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Cài đặt uv
RUN pip install --no-cache-dir uv

# 3. BƯỚC QUAN TRỌNG NHẤT: Cài đặt mồi bằng pip (không dùng uv ở bước này)
# Chúng ta cài numpy và setuptools bản cũ hơn một chút để tương thích với LightFM
RUN pip install --no-cache-dir "setuptools<70.0.0" wheel Cython numpy==1.26.4

# 4. Cài đặt LightFM riêng lẻ bằng pip để tránh cơ chế build nghiêm ngặt của uv
RUN pip install --no-cache-dir lightfm==1.17

# 5. Bây giờ mới copy file cấu hình project
COPY pyproject.toml uv.lock* ./

# 6. Dùng uv cài các gói còn lại (uv sẽ thấy lightfm đã có sẵn và bỏ qua nó)
RUN uv pip install --system -e .

# 7. Copy toàn bộ code
COPY app ./app
COPY scripts ./scripts

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]