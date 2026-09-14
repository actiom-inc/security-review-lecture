resource "google_sql_database_instance" "app" {
  name                = "security-review-db"
  database_version    = "POSTGRES_16"
  region              = var.region
  deletion_protection = false

  settings {
    tier = "db-custom-1-3840"

    ip_configuration {
      ipv4_enabled = true

      authorized_networks {
        name  = "anywhere"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled = false
    }
  }
}

resource "google_sql_database" "app" {
  name     = "app"
  instance = google_sql_database_instance.app.name
}

resource "google_sql_user" "app" {
  name     = "app"
  instance = google_sql_database_instance.app.name
  password = var.db_password
}
