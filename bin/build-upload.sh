#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

HOST="${HOST:-154.26.180.195}"
SSH_USER="${SSH_USER:-root}"
REMOTE_PATH="${REMOTE_PATH:-/root}"
IMAGE_NAME="${IMAGE_NAME:-new-api}"
IMAGE_TAG="${IMAGE_TAG:-linux-amd64}"
DOCKERFILE="${DOCKERFILE:-${ROOT_DIR}/Dockerfile}"
BUILD_DIR="${ROOT_DIR}/tmp-build"
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

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon 不可用，请先启动 Docker" >&2
  exit 1
fi

if [ ! -f "$DOCKERFILE" ]; then
  echo "Dockerfile 不存在: $DOCKERFILE" >&2
  exit 1
fi

# 清理临时目录
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "==> 开始构建镜像 (原生 ARM + Go 交叉编译)"
DOCKER_BUILDKIT=0 docker build \
  --build-arg TARGETOS=linux \
  --build-arg TARGETARCH=amd64 \
  -t "$IMAGE_REF" \
  -f "$DOCKERFILE" \
  "$ROOT_DIR"

if ! docker image inspect "$IMAGE_REF" >/dev/null 2>&1; then
  echo "镜像构建失败: $IMAGE_REF" >&2
  exit 1
fi

echo "==> 提取二进制文件"
docker create --name temp-extract "$IMAGE_REF"
docker cp temp-extract:/new-api "$BUILD_DIR/new-api"
docker rm temp-extract

if [ ! -f "$BUILD_DIR/new-api" ]; then
  echo "二进制文件提取失败" >&2
  exit 1
fi

# 检查二进制文件架构
file "$BUILD_DIR/new-api"

echo "==> 创建服务器端 Dockerfile"
cat > "$BUILD_DIR/Dockerfile" << 'EOF'
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

COPY new-api /new-api
RUN chmod +x /new-api
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/new-api"]
EOF

echo "==> 打包构建文件"
tar czf "$BUILD_DIR/new-api-build.tar.gz" -C "$BUILD_DIR" new-api Dockerfile

if [ ! -s "$BUILD_DIR/new-api-build.tar.gz" ]; then
  echo "打包失败" >&2
  exit 1
fi

echo "==> 上传到服务器: $SCP_TARGET"
echo "请输入服务器密码:"
scp "$BUILD_DIR/new-api-build.tar.gz" "$SCP_TARGET"

echo ""
echo "==> 完成"
echo "已上传: ${REMOTE_PATH}/new-api-build.tar.gz"
echo "请在服务器执行: bash ${REMOTE_PATH}/deploy.sh"
