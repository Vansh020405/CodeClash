from django.urls import path
from .views import SubmissionCreateView, SubmissionListView

urlpatterns = [
    path('create/', SubmissionCreateView.as_view(), name='submit-code'),
    path('', SubmissionListView.as_view(), name='submission-history'),
]
