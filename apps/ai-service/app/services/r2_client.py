"""
Cloudflare R2 client using boto3 S3-compatible API.
Used for uploading and downloading ML model artifacts.
"""

import io
import pickle
import logging
from typing import Any

import boto3
from botocore.exceptions import ClientError

from ..config import settings

logger = logging.getLogger(__name__)

_s3_client = None


import os
from pathlib import Path

def get_s3_client():
    global _s3_client
    if _s3_client is None:
        if not settings.R2_ACCOUNT_ID:
            # Fallback to local mode
            return None
        _s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY,
            aws_secret_access_key=settings.R2_SECRET_KEY,
            region_name="auto",
        )
    return _s3_client


def _get_local_path(key: str) -> Path:
    """Helper to get local filesystem path for a given artifact key."""
    # Ensure artifacts are stored in /app/data inside docker, or apps/ai-service/data local
    base_dir = Path("data")
    full_path = base_dir / key
    full_path.parent.mkdir(parents=True, exist_ok=True)
    return full_path


def upload_pickle(obj: Any, key: str) -> str:
    """Serialize obj with pickle and upload to R2 or save locally."""
    s3 = get_s3_client()
    data = pickle.dumps(obj, protocol=pickle.HIGHEST_PROTOCOL)

    if s3 is None:
        # Local mode
        local_path = _get_local_path(key)
        local_path.write_bytes(data)
        logger.info(f"Saved artifact locally: {local_path} ({len(data):,} bytes)")
        return f"local://{key}"

    try:
        s3.put_object(
            Bucket=settings.R2_BUCKET,
            Key=key,
            Body=data,
            ContentType="application/octet-stream",
        )
        logger.info(f"Uploaded artifact to R2: {key} ({len(data):,} bytes)")
        return f"r2://{settings.R2_BUCKET}/{key}"
    except ClientError as e:
        logger.error(f"R2 upload failed for {key}: {e}")
        raise


def download_pickle(key: str) -> Any:
    """Download a pickle artifact from R2 or read from local filesystem."""
    s3 = get_s3_client()

    if s3 is None:
        local_path = _get_local_path(key)
        if not local_path.exists():
            raise FileNotFoundError(f"Local artifact not found: {local_path}")
        data = local_path.read_bytes()
        logger.info(f"Read artifact locally: {key} ({len(data):,} bytes)")
        return pickle.loads(data)

    try:
        response = s3.get_object(Bucket=settings.R2_BUCKET, Key=key)
        data = response["Body"].read()
        logger.info(f"Downloaded artifact from R2: {key} ({len(data):,} bytes)")
        return pickle.loads(data)
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            raise FileNotFoundError(f"R2 artifact not found: {key}")
        logger.error(f"R2 download failed for {key}: {e}")
        raise


def upload_bytes(data: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    """Upload raw bytes to R2 or save locally."""
    s3 = get_s3_client()

    if s3 is None:
        local_path = _get_local_path(key)
        local_path.write_bytes(data)
        return f"local://{key}"

    try:
        s3.put_object(
            Bucket=settings.R2_BUCKET,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return f"r2://{settings.R2_BUCKET}/{key}"
    except ClientError as e:
        logger.error(f"R2 upload (bytes) failed for {key}: {e}")
        raise


def list_model_versions(prefix: str = "models/") -> list[str]:
    """List all versions available in R2 or local filesystem under a prefix."""
    s3 = get_s3_client()

    if s3 is None:
        base_dir = Path("data") / prefix
        if not base_dir.exists():
            return []
        # Return directories under prefix
        return [f"{d.name}/" for d in base_dir.iterdir() if d.is_dir()]

    try:
        response = s3.list_objects_v2(
            Bucket=settings.R2_BUCKET, Prefix=prefix, Delimiter="/"
        )
        prefixes = response.get("CommonPrefixes", [])
        return [p["Prefix"] for p in prefixes]
    except ClientError as e:
        logger.error(f"R2 list failed: {e}")
        return []
