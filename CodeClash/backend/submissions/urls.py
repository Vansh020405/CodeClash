from django.urls import path
from .views import SubmissionCreateView, SubmissionListView

urlpatterns = [
    path('', SubmissionCreateView.as_view(), name='submit-code'),
    path('history/', SubmissionListView.as_view(), name='submission-history'),
]
