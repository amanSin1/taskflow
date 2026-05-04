from django.urls import path
from .views import TaskListCreateView, TaskDetailView, DashboardView

urlpatterns = [
    path("projects/<int:project_id>/tasks/", TaskListCreateView.as_view(), name="task-list"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]