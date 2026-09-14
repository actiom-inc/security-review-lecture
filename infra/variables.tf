variable "project_id" {
  description = "Training-only GCP project ID. Do not point this fixture at a real project."
  type        = string
  default     = "security-review-training"
}

variable "region" {
  type    = string
  default = "asia-northeast1"
}

variable "container_image" {
  type    = string
  default = "asia-northeast1-docker.pkg.dev/security-review-training/apps/security-review-api:demo"
}

variable "db_password" {
  description = "Database password used by the demo API."
  type        = string
  default     = "training-demo-password-change-me"
}
