from rest_framework import generics, permissions
from .models import Submission
from .serializers import SubmissionSerializer, CreateSubmissionSerializer

class SubmissionCreateView(generics.CreateAPIView):
    # For MVP, we allow unauthenticated submissions temporarily if needed, 
    # but strictly we should require Auth. Let's start with IsAuthenticated.
    permission_classes = [permissions.IsAuthenticated] 
    serializer_class = CreateSubmissionSerializer

    def perform_create(self, serializer):
        # Determine Verdict (MOCK for now) -> Real judging happens in Phase 3
        # For now, we just save it as Pending
        serializer.save(user=self.request.user)

class SubmissionListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SubmissionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(username='guest')
            except User.DoesNotExist:
                return Submission.objects.none()

        queryset = Submission.objects.filter(user=user).order_by('-created_at')
        problem_id = self.request.query_params.get('problem_id')
        if problem_id:
            queryset = queryset.filter(problem_id=problem_id)
        return queryset
