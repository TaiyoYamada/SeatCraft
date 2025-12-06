# ============================================================
# Terraform Configuration
# SeatCraft Infrastructure
# ============================================================

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # 本番環境では S3 バックエンドを使用
  # backend "s3" {
  #   bucket         = "seatcraft-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "ap-northeast-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SeatCraft"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
