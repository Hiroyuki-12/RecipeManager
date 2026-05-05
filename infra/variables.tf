variable "project" {
  description = "プロジェクト識別子。リソース名・タグの prefix に使う"
  type        = string
  default     = "recipemanager"
}

variable "region" {
  description = "デプロイ先 AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "リソースの Environment タグ"
  type        = string
  default     = "prod"
}

variable "my_ip" {
  description = "SSH / HTTP 接続を許可する自宅 IP (CIDR 形式 例: 203.0.113.10/32)。terraform.tfvars で設定し Git にコミットしないこと"
  type        = string
}

variable "key_name" {
  description = "EC2 にアタッチする SSH キーペア名 (事前に AWS CLI で作成済みのもの)"
  type        = string
  default     = "recipemanager-key"
}

variable "db_name" {
  description = "RDS の DB 名"
  type        = string
  default     = "recipemanager"
}

variable "db_username" {
  description = "RDS の master ユーザー"
  type        = string
  default     = "recipe_user"
}

variable "db_password" {
  description = "RDS の master パスワード (terraform.tfvars で指定、Git 管理外)"
  type        = string
  sensitive   = true
}

variable "rails_master_key" {
  description = "Rails の RAILS_MASTER_KEY (config/master.key の内容。terraform.tfvars で指定、Git 管理外)"
  type        = string
  sensitive   = true
}

variable "ghcr_token" {
  description = "ghcr.io からイメージを pull するための GitHub Personal Access Token (read:packages 権限)"
  type        = string
  sensitive   = true
}
