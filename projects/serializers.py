from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember
from accounts.serializers import UserSerializer

User = get_user_model()


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user", write_only=True
    )

    class Meta:
        model = ProjectMember
        fields = ["id", "user", "user_id", "role", "joined_at"]


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = ProjectMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["id", "name", "description", "owner", "members", "member_count", "created_at"]
        read_only_fields = ["id", "owner", "created_at"]

    def get_member_count(self, obj):
        return obj.members.count()