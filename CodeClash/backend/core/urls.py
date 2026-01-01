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
from ai_views import generate_problem, save_generated_problem, generate_test_cases, generator_status
from api_template_first import generate_from_template_first

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/problems/', include('problems.urls')),
    path('api/submit/', include('submissions.urls')),
    path('api/executor/', include('executor.urls')),
    
    # AI Generator endpoints
    path('api/ai/generate/', generate_problem, name='ai-generate'),
    path('api/ai/generate-similar/', generate_from_template_first, name='ai-generate-similar'),
    path('api/ai/save/', save_generated_problem, name='ai-save'),
    path('api/ai/generate-tests/', generate_test_cases, name='ai-generate-tests'),
    path('api/ai/status/', generator_status, name='ai-status'),
]
