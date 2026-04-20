#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

IMAGE_NAME="new-api"
IMAGE_TAG="latest"

echo "==> 构建 Docker 镜像"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" "$REPO_DIR"

echo "==> 构建完成: ${IMAGE_NAME}:${IMAGE_TAG}"
