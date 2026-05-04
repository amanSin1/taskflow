from rest_framework import serializers
from .models import Task
from accounts.serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_detail = UserSerializer(source="assigned_to", read_only=True)
    created_by_detail = UserSerializer(source="created_by", read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "project",
            "assigned_to", "assigned_to_detail",
            "created_by", "created_by_detail",
            "status", "priority", "due_date",
            "is_overdue", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.due_date and obj.status != Task.Status.DONE:
            return obj.due_date < timezone.now().date()
        return False

    def validate(self, data):
        """
        Ensure assigned_to user is actually a member of the project.
        This runs on both create and update.
        """
        from projects.models import ProjectMember

        project = data.get("project") or getattr(self.instance, "project", None)
        assigned_to = data.get("assigned_to")

        if assigned_to and project:
            is_member = ProjectMember.objects.filter(
                project=project, user=assigned_to
            ).exists()
            if not is_member:
                raise serializers.ValidationError(
                    {"assigned_to": "This user is not a member of the project."}
                )
        return data