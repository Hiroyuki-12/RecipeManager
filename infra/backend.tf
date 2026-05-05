# S3 バックエンド設定は providers.tf の terraform ブロック内で定義しています。
# このファイルは S3 バケットと DynamoDB テーブルの事前作成手順を示す参考コメントです。
#
# 初回セットアップ時に以下を手動で実行してください:
#
# aws s3api create-bucket \
#   --bucket recipemanager-tfstate \
#   --region ap-northeast-1 \
#   --create-bucket-configuration LocationConstraint=ap-northeast-1
#
# aws s3api put-bucket-versioning \
#   --bucket recipemanager-tfstate \
#   --versioning-configuration Status=Enabled
#
# aws s3api put-public-access-block \
#   --bucket recipemanager-tfstate \
#   --public-access-block-configuration \
#     BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
#
# aws dynamodb create-table \
#   --table-name recipemanager-tflock \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region ap-northeast-1
