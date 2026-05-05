output "ec2_public_ip" {
  description = "EC2 インスタンスのパブリック IP"
  value       = aws_instance.app.public_ip
}

output "ec2_public_dns" {
  description = "EC2 インスタンスのパブリック DNS"
  value       = aws_instance.app.public_dns
}

output "ssh_command" {
  description = "EC2 への SSH コマンド"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_instance.app.public_dns}"
}

output "app_url" {
  description = "アプリ URL"
  value       = "http://${aws_instance.app.public_ip}"
}

output "rds_endpoint" {
  description = "RDS エンドポイント"
  value       = aws_db_instance.main.address
}
