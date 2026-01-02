"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from ai_views import normalize_problem, save_generated_problem, generator_status

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/problems/', include('problems.urls')),
    path('api/submissions/', include('submissions.urls')),
    path('api/executor/', include('executor.urls')),
    
    # AI Generator endpoints (Normalization Only)
    path('api/ai/normalize/', normalize_problem, name='ai-normalize'),
    path('api/ai/save/', save_generated_problem, name='ai-save'),
    path('api/ai/status/', generator_status, name='ai-status'),
]
