from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import ProjectMember


def get_membership(user, project):
    """Helper — returns ProjectMember or None."""
    return ProjectMember.objects.filter(project=project, user=user).first()


class IsProjectMember(BasePermission):
    """
    Allows access only if the user is a member (any role) of the project.
    Used for: reading project details, listing tasks.
    """
    message = "You are not a member of this project."

    def has_object_permission(self, request, view, obj):
        # obj is a Project instance here
        return ProjectMember.objects.filter(project=obj, user=request.user).exists()


class IsProjectAdmin(BasePermission):
    """
    Allows write access only to project admins.
    Used for: editing project, adding members, deleting project.
    """
    message = "Only project admins can perform this action."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Read is allowed to any member
            return ProjectMember.objects.filter(project=obj, user=request.user).exists()
        # Write requires admin role
        return ProjectMember.objects.filter(
            project=obj, user=request.user, role=ProjectMember.Role.ADMIN
        ).exists()