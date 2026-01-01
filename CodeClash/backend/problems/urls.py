from django.urls import path
from .views import ProblemListView, ProblemDetailView, delete_problem

urlpatterns = [
    path('', ProblemListView.as_view(), name='problem-list'),
    path('<slug:slug>/', ProblemDetailView.as_view(), name='problem-detail'),
    path('<slug:slug>/delete/', delete_problem, name='problem-delete'),
]
