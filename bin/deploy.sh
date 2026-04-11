#!/usr/bin/env bash

set -euo pipefail

IMAGE_NAME="new-api"
IMAGE_TAG="linux-amd64"
CONTAINER_NAME="new-api"
BUILD_TAR="/root/new-api-build.tar.gz"
BUILD_DIR="/root/new-api-build"
DATA_DIR="/root/new-api-data"
SESSION_SECRET="45c1956792262cb4b2742007cd137fec31205e8af0600525da71fbbac8693d30"

echo "==> 停止旧容器"
docker stop "$CONTAINER_NAME" 2>/dev/null || echo "容器不存在，跳过"

echo "==> 删除旧容器"
docker rm "$CONTAINER_NAME" 2>/dev/null || echo "容器不存在，跳过"

echo "==> 删除旧镜像"
docker rmi "${IMAGE_NAME}:${IMAGE_TAG}" 2>/dev/null || echo "镜像不存在，跳过"

echo "==> 解压构建文件"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
tar xzf "$BUILD_TAR" -C "$BUILD_DIR"

echo "==> 构建镜像"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" "$BUILD_DIR"

echo "==> 启动新容器"
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart always \
  -p 3000:3000 \
  -v "${DATA_DIR}:/data" \
  -e TZ=Asia/Shanghai \
  -e SESSION_SECRET="$SESSION_SECRET" \
  "${IMAGE_NAME}:${IMAGE_TAG}"

echo "==> 完成，容器状态："
docker ps --filter "name=$CONTAINER_NAME"
