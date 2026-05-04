from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from .permissions import IsProjectAdmin, IsProjectMember


class ProjectListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/projects/     — list projects the logged-in user belongs to
    POST /api/projects/     — create a new project (requester becomes admin)
    """
    serializer_class = ProjectSerializer

    def get_queryset(self):
        # Only return projects the user is a member of
        return Project.objects.filter(members__user=self.request.user).distinct()

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        # Creator automatically gets admin membership
        ProjectMember.objects.create(
            project=project,
            user=self.request.user,
            role=ProjectMember.Role.ADMIN,
        )


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/projects/{id}/   — any member can view
    PUT    /api/projects/{id}/   — admin only
    DELETE /api/projects/{id}/   — admin only
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsProjectAdmin]

    def get_queryset(self):
        return Project.objects.filter(members__user=self.request.user)


class ProjectMemberView(APIView):
    """
    POST   /api/projects/{id}/members/   — add a member (admin only)
    DELETE /api/projects/{id}/members/   — remove a member (admin only)
    Body: { "user_id": 5, "role": "member" }
    """

    def get_project(self, pk, user):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return None, Response({"error": "Project not found."}, status=404)

        is_admin = ProjectMember.objects.filter(
            project=project, user=user, role=ProjectMember.Role.ADMIN
        ).exists()
        if not is_admin:
            return None, Response({"error": "Admin access required."}, status=403)

        return project, None

    def post(self, request, pk):
        project, err = self.get_project(pk, request.user)
        if err:
            return err

        serializer = ProjectMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # unique_together on model will raise IntegrityError if duplicate
        try:
            member = serializer.save(project=project)
        except Exception:
            return Response({"error": "User is already a member."}, status=400)

        return Response(ProjectMemberSerializer(member).data, status=201)

    def delete(self, request, pk):
        project, err = self.get_project(pk, request.user)
        if err:
            return err

        user_id = request.data.get("user_id")
        ProjectMember.objects.filter(project=project, user_id=user_id).delete()
        return Response(status=204)