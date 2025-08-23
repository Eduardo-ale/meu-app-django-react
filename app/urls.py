"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.views.generic import RedirectView
from accounts.views import HomeView
from django.contrib.staticfiles.storage import staticfiles_storage
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('', HomeView.as_view(), name='home'),
    path('', include('municipios.urls')),
    path('favicon.ico', RedirectView.as_view(url=staticfiles_storage.url('images/favicons/favicon.ico'))),
    path('favicon-32x32.png', RedirectView.as_view(url=staticfiles_storage.url('images/favicons/favicon-32x32.png'))),
    path('favicon-16x16.png', RedirectView.as_view(url=staticfiles_storage.url('images/favicons/favicon-16x16.png'))),
]

# Servir arquivos de media e estáticos durante o desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Em desenvolvimento, usar staticfiles serve que funciona com STATICFILES_DIRS
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += staticfiles_urlpatterns()
