from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Open to everyone — no auth needed.
    Returns JWT tokens immediately on signup so user doesn't have to login separately.
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(tokens.access_token),
            "refresh": str(tokens),
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """
    POST /api/auth/login/
    Body: { "email": "...", "password": "..." }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(tokens.access_token),
            "refresh": str(tokens),
        })


class MeView(generics.RetrieveAPIView):
    """GET /api/auth/me/ — returns the logged-in user's profile."""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user