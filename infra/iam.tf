resource "google_project_iam_member" "app_editor" {
  project = var.project_id
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.app.email}"
}
