terraform {
  backend "s3" {
    bucket         = "anuka-remote-terraform-backend"
    key            = "gsheet-shared-expenses-inserter/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
  }
}
