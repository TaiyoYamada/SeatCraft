# ============================================================
# DynamoDB Table
# ============================================================

resource "aws_dynamodb_table" "layouts" {
  name         = "${var.project_name}_layouts_${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  # TTL for auto-cleanup (optional)
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = var.environment == "prod"
  }

  tags = {
    Name = "${var.project_name}-layouts-${var.environment}"
  }
}

# ============================================================
# Outputs
# ============================================================

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.layouts.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.layouts.arn
}
