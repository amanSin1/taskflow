from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, ProjectMemberView

urlpatterns = [
    path("projects/", ProjectListCreateView.as_view(), name="project-list"),
    path("projects/<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path("projects/<int:pk>/members/", ProjectMemberView.as_view(), name="project-members"),
]