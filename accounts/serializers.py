from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        # Use create_user so password gets hashed — never save raw password
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Used for displaying user info (no password)."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]