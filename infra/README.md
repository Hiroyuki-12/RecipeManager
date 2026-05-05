# AWS デプロイ手順

RecipeManager を AWS (EC2 + RDS MySQL) にデプロイするための手順です。

## アーキテクチャ

```
nginx (port 80)
  ├── /api/* → Rails API container (port 3001)
  └── /*     → Next.js container  (port 3000)

RDS MySQL 8.0 (db.t3.micro, private subnet)
EC2 t2.micro (Amazon Linux 2023, public subnet)
```

EC2 上でのビルドは行わず、**ローカルでビルドした Docker イメージを ghcr.io にプッシュ → EC2 は pull して起動するだけ**にしています（t2.micro の OOM 対策）。

## 前提条件

- AWS CLI 設定済み (`aws configure`)
- Terraform >= 1.9 インストール済み
- Docker Desktop 起動済み
- `gh` CLI 認証済み (`gh auth login`)
- GitHub PAT (Scopes: `write:packages`, `read:packages`) を取得済み

## セットアップ手順

### 1. Terraform バックエンド用 S3 + DynamoDB を作成（初回のみ）

```bash
# S3 バケット
aws s3api create-bucket \
  --bucket recipemanager-tfstate \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

aws s3api put-bucket-versioning \
  --bucket recipemanager-tfstate \
  --versioning-configuration Status=Enabled

aws s3api put-public-access-block \
  --bucket recipemanager-tfstate \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# DynamoDB テーブル
aws dynamodb create-table \
  --table-name recipemanager-tflock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1
```

### 2. EC2 SSH キーペアを作成

```bash
aws ec2 create-key-pair \
  --key-name recipemanager-key \
  --region ap-northeast-1 \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/recipemanager-key.pem
chmod 400 ~/.ssh/recipemanager-key.pem
```

### 3. terraform.tfvars を作成

```bash
cp infra/terraform.tfvars.example infra/terraform.tfvars
# エディタで各値を設定
```

`my_ip` は `curl ifconfig.me` で確認した自宅 IP を `/32` 付きで設定します。  
`rails_master_key` は `cat backend/config/master.key` の値を設定します。

### 4. ghcr.io へのログイン

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u Hiroyuki-12 --password-stdin
```

### 5. イメージをビルド＆プッシュ

```bash
make release
```

### 6. Terraform 初期化＆デプロイ

```bash
cd infra && terraform init
cd ..
make deploy
```

`terraform apply` 完了後、EC2 の初期化に 3〜5 分かかります。

### 7. 動作確認

```bash
# EC2 の IP を確認
cd infra && terraform output app_url

# SSH でコンテナ状態を確認
make status

# ブラウザで確認
open $(cd infra && terraform output -raw app_url)
```

## 再デプロイ（コード更新時）

```bash
make release   # イメージを再ビルド＆プッシュ
make redeploy  # EC2 を作り直して最新イメージを取得
```

## トラブルシューティング

### コンテナが起動しない

```bash
make ssh
sudo docker compose -f /opt/recipemanager/compose.prod.yaml logs
```

### nginx が 502 を返す

コンテナの起動を待っている可能性があります。30 秒待ってからリロードしてください。

```bash
make status
```

### user_data の実行ログを確認

```bash
make ssh
sudo cat /var/log/cloud-init-output.log
```

## リソース削除

```bash
make destroy
```

その後、S3 バケットと DynamoDB テーブルも不要なら手動で削除してください。
