resource "google_service_account" "app" {
  account_id   = "security-review-api"
  display_name = "Security Review Demo API"
}

resource "google_cloud_run_v2_service" "api" {
  name                = "security-review-api"
  location            = var.region
  deletion_protection = false
  ingress             = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.app.email

    containers {
      image = var.container_image

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "DB_HOST"
        value = google_sql_database_instance.app.public_ip_address
      }

      env {
        name  = "DB_PASSWORD"
        value = var.db_password
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  project  = var.project_id
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
