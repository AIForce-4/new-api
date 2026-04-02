#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PLATFORM="${PLATFORM:-linux/amd64}"
HOST="${HOST:-154.26.180.195}"
SSH_USER="${SSH_USER:-root}"
REMOTE_PATH="${REMOTE_PATH:-/root}"
IMAGE_NAME="${IMAGE_NAME:-new-api}"
IMAGE_TAG="${IMAGE_TAG:-linux-amd64}"
TAR_NAME="${TAR_NAME:-${IMAGE_NAME}-${IMAGE_TAG}.tar}"
DOCKERFILE="${DOCKERFILE:-${ROOT_DIR}/Dockerfile}"
CONTEXT_DIR="${CONTEXT_DIR:-${ROOT_DIR}}"
IMAGE_REF="${IMAGE_NAME}:${IMAGE_TAG}"
SCP_TARGET="${SSH_USER}@${HOST}:${REMOTE_PATH}/"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "缺少命令: $1" >&2
    exit 1
  fi
}

require_command docker
require_command ssh
require_command scp

if ! docker buildx version >/dev/null 2>&1; then
  echo "docker buildx 不可用" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon 不可用，请先启动 Docker" >&2
  exit 1
fi

if [ ! -f "$DOCKERFILE" ]; then
  echo "Dockerfile 不存在: $DOCKERFILE" >&2
  exit 1
fi

if [ ! -d "$CONTEXT_DIR" ]; then
  echo "构建上下文目录不存在: $CONTEXT_DIR" >&2
  exit 1
fi

echo "开始构建镜像: $IMAGE_REF"
docker buildx build \
  --platform "$PLATFORM" \
  --tag "$IMAGE_REF" \
  --load \
  --file "$DOCKERFILE" \
  "$CONTEXT_DIR"

if ! docker image inspect "$IMAGE_REF" >/dev/null 2>&1; then
  echo "镜像未成功加载到本地: $IMAGE_REF" >&2
  exit 1
fi

echo "开始导出镜像: $TAR_NAME"
docker save -o "$TAR_NAME" "$IMAGE_REF"

if [ ! -s "$TAR_NAME" ]; then
  echo "导出的 tar 文件为空: $TAR_NAME" >&2
  exit 1
fi

echo "开始上传文件到: $SCP_TARGET"
scp "$TAR_NAME" "$SCP_TARGET"

echo "完成"
echo "镜像: $IMAGE_REF"
echo "tar 文件: $TAR_NAME"
echo "远端位置: ${REMOTE_PATH%/}/$(basename "$TAR_NAME")"
echo "可在远端执行: docker load -i ${REMOTE_PATH%/}/$(basename "$TAR_NAME")"
