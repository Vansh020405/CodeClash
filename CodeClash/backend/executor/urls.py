from django.urls import path
from .views import JudgeSubmissionView, RunCodeView, ValidateReferenceView

urlpatterns = [
    path('submit/', JudgeSubmissionView.as_view(), name='judge_submit'),
    path('run/', RunCodeView.as_view(), name='run_code'),
    path('validate/', ValidateReferenceView.as_view(), name='validate_reference'),
]
