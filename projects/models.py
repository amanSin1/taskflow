from django.db import models
from django.conf import settings


class Project(models.Model):
    """
    A project is created by a user (owner).
    The owner is automatically made admin in ProjectMember.
    """
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_projects",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ProjectMember(models.Model):
    """
    Joins users to projects with a role.

    WHY a separate model and not a ManyToManyField with through?
    Because we need to store the role per membership — so we
    use an explicit through model (ProjectMember) instead of
    Django's default M2M join table.

    ROLES:
    - admin: can edit project, add/remove members, manage all tasks
    - member: can create/update tasks, view project
    """

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_memberships",
    )
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "user")  # one membership per user per project

    def __str__(self):
        return f"{self.user.email} → {self.project.name} ({self.role})"