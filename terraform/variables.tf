variable "aws_region" {
  description = "AWS region"
  default     = "eu-central-1"
}

variable "bucket_name" {
  description = "The name of the S3 bucket"
  type        = string
}
