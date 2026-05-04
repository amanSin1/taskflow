from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model.
    WHY extend AbstractUser instead of AbstractBaseUser?
    AbstractUser gives us username, email, password, is_staff etc for free.
    We just add a global `role` field on top.

    NOTE: Project-level roles (admin/member per project) are handled
    in the ProjectMember model — not here. This role is app-wide.
    """

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)

    # Use email as the login field instead of username
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email