#!/bin/bash
set -euxo pipefail
# Amazon Linux 2023 初期セットアップ:
#  - Docker / Docker Compose plugin / git / nginx インストール
#  - ghcr.io からビルド済みイメージを pull (EC2 上でのビルドなし)
#  - RDS 接続情報・Rails master key を /opt/recipemanager/.env として書き出し
#  - compose.prod.yaml で Rails + Next.js を起動
#  - nginx で /api/* を Rails(3001)、/* を Next.js(3000) にリバプロ

# 1. パッケージ
dnf -y update
dnf -y install docker git nginx

# 2. Docker
systemctl enable --now docker
usermod -aG docker ec2-user

# 3. Docker Compose plugin
DOCKER_CONFIG_DIR=/usr/libexec/docker/cli-plugins
mkdir -p "$DOCKER_CONFIG_DIR"
COMPOSE_VERSION="v2.29.7"
ARCH="$(uname -m)"
curl -sSL "https://github.com/docker/compose/releases/download/$${COMPOSE_VERSION}/docker-compose-linux-$${ARCH}" \
  -o "$DOCKER_CONFIG_DIR/docker-compose"
chmod +x "$DOCKER_CONFIG_DIR/docker-compose"

# 4. リポジトリ取得
APP_DIR=/opt/recipemanager
git clone https://github.com/Hiroyuki-12/RecipeManager.git "$APP_DIR"

# 5. 環境変数ファイルを書き出し
cat > "$APP_DIR/.env" <<EOF
DB_HOST=${db_host}
DB_PORT=${db_port}
DB_NAME=${db_name}
DB_USERNAME=${db_username}
DB_PASSWORD=${db_password}
RAILS_MASTER_KEY=${rails_master_key}
EOF
chmod 600 "$APP_DIR/.env"

chown -R ec2-user:ec2-user "$APP_DIR"

# 6. ghcr.io にログインしてイメージを pull (ビルドなし)
echo "${ghcr_token}" | docker login ghcr.io -u Hiroyuki-12 --password-stdin
cd "$APP_DIR"
docker compose -f compose.prod.yaml pull

# 7. コンテナ起動 (Rails DB マイグレーションは entrypoint で自動実行)
docker compose -f compose.prod.yaml up -d

# 8. nginx 設定
rm -f /etc/nginx/conf.d/default.conf
cp "$APP_DIR/infra/nginx.conf" /etc/nginx/conf.d/recipemanager.conf
nginx -t

# 9. nginx 起動
systemctl enable --now nginx
