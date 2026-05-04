from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import Task
from .serializers import TaskSerializer
from .filters import TaskFilter
from projects.models import Project, ProjectMember


def is_project_member(user, project):
    return ProjectMember.objects.filter(project=project, user=user).exists()

def is_project_admin(user, project):
    return ProjectMember.objects.filter(
        project=project, user=user, role=ProjectMember.Role.ADMIN
    ).exists()


class TaskListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/projects/{project_id}/tasks/   — list tasks for a project
    POST /api/projects/{project_id}/tasks/   — create a task

    Filtering: ?status=todo&priority=high&overdue=true&assigned_to=2
    Search:    ?search=bug
    """
    serializer_class = TaskSerializer
    filterset_class = TaskFilter
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "due_date", "priority"]

    def get_queryset(self):
        project_id = self.kwargs["project_id"]
        # Ensure user is a member before showing any tasks
        return Task.objects.filter(
            project_id=project_id,
            project__members__user=self.request.user,
        ).select_related("assigned_to", "created_by", "project")

    def perform_create(self, serializer):
        project_id = self.kwargs["project_id"]
        project = Project.objects.get(pk=project_id)

        if not is_project_member(self.request.user, project):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not a member of this project.")

        serializer.save(created_by=self.request.user, project=project)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/tasks/{id}/   — any project member
    PUT    /api/tasks/{id}/   — assignee or project admin
    DELETE /api/tasks/{id}/   — project admin only
    """
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(
            project__members__user=self.request.user
        ).select_related("assigned_to", "created_by", "project")

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        user = request.user

        # Only assignee or project admin can update
        can_update = (
            task.assigned_to == user or
            is_project_admin(user, task.project)
        )
        if not can_update:
            return Response(
                {"error": "Only the assignee or a project admin can update this task."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        if not is_project_admin(request.user, task.project):
            return Response(
                {"error": "Only project admins can delete tasks."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)


class DashboardView(APIView):
    """
    GET /api/dashboard/
    Returns a summary of tasks assigned to the logged-in user across all projects.
    This is what powers the dashboard cards on the frontend.
    """

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        my_tasks = Task.objects.filter(assigned_to=user).select_related("project")

        total = my_tasks.count()
        todo = my_tasks.filter(status=Task.Status.TODO).count()
        in_progress = my_tasks.filter(status=Task.Status.IN_PROGRESS).count()
        done = my_tasks.filter(status=Task.Status.DONE).count()
        overdue = my_tasks.filter(
            due_date__lt=today
        ).exclude(status=Task.Status.DONE).count()

        # Recent overdue tasks (max 5) for display
        overdue_tasks = TaskSerializer(
            my_tasks.filter(due_date__lt=today).exclude(status=Task.Status.DONE)[:5],
            many=True,
        ).data

        return Response({
            "summary": {
                "total": total,
                "todo": todo,
                "in_progress": in_progress,
                "done": done,
                "overdue": overdue,
            },
            "overdue_tasks": overdue_tasks,
        })