#!/usr/bin/env bash

set -euo pipefail

IMAGE_NAME="new-api"
IMAGE_TAG="latest"
CONTAINER_NAME="new-api"
DATA_DIR="/root/new-api-data"
SESSION_SECRET="${SESSION_SECRET:-45c1956792262cb4b2742007cd137fec31205e8af0600525da71fbbac8693d30}"

echo "==> 停止旧容器"
docker stop "$CONTAINER_NAME" 2>/dev/null || echo "容器不存在，跳过"

echo "==> 删除旧容器"
docker rm "$CONTAINER_NAME" 2>/dev/null || echo "容器不存在，跳过"

echo "==> 启动新容器"
mkdir -p "$DATA_DIR"
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart always \
  -p 3000:3000 \
  -v "${DATA_DIR}:/data" \
  -e TZ=Asia/Shanghai \
  -e SESSION_SECRET="$SESSION_SECRET" \
  "${IMAGE_NAME}:${IMAGE_TAG}"

echo "==> 清理旧镜像"
docker image prune -f

echo "==> 完成，容器状态："
docker ps --filter "name=$CONTAINER_NAME"
