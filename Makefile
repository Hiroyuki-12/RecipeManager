.PHONY: build build-backend build-frontend release deploy redeploy destroy ssh logs status

GHCR_REPO := ghcr.io/hiroyuki-12/recipemanager
BACKEND_IMAGE := $(GHCR_REPO)-backend:latest
FRONTEND_IMAGE := $(GHCR_REPO)-frontend:latest

# バックエンド Docker イメージをローカルでビルド
build-backend:
	docker build -t $(BACKEND_IMAGE) ./backend
	@echo "Built $(BACKEND_IMAGE)"

# フロントエンド Docker イメージをローカルでビルド
build-frontend:
	docker build -t $(FRONTEND_IMAGE) ./frontend
	@echo "Built $(FRONTEND_IMAGE)"

# 両方ビルド
build: build-backend build-frontend

# ghcr.io にプッシュ (事前に: echo $GITHUB_TOKEN | docker login ghcr.io -u Hiroyuki-12 --password-stdin)
release: build
	docker push $(BACKEND_IMAGE)
	docker push $(FRONTEND_IMAGE)
	@echo "Pushed to ghcr.io"

# 初回デプロイ
deploy:
	cd infra && terraform apply

# EC2 だけ作り直し (新しいイメージを反映させたい時)
redeploy:
	cd infra && terraform apply -replace=aws_instance.app

# 全リソース削除
destroy:
	cd infra && terraform destroy

# EC2 へ SSH
ssh:
	@cd infra && eval $$(terraform output -raw ssh_command)

# コンテナログ
logs:
	@DNS=$$(cd infra && terraform output -raw ec2_public_dns); \
	ssh -i ~/.ssh/recipemanager-key.pem ec2-user@$$DNS \
	  'cd /opt/recipemanager && sudo docker compose -f compose.prod.yaml logs --tail=100 -f'

# コンテナ・nginx の状態確認
status:
	@DNS=$$(cd infra && terraform output -raw ec2_public_dns); \
	ssh -i ~/.ssh/recipemanager-key.pem ec2-user@$$DNS \
	  'cd /opt/recipemanager && sudo docker compose -f compose.prod.yaml ps; echo; sudo systemctl is-active nginx'
