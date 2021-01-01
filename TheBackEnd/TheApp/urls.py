from django.urls import path

from django.urls import re_path
from django.views.static import serve as static_serve

from . import views

urlpatterns = [
    path('search/', views.search),
    re_path(r'^thumbs/(?P<path>.*)$', static_serve, {
        'document_root': 'TheApp/flowers/thumbs',
    }),
    re_path(r'^images/(?P<path>.*)$', static_serve, {
        'document_root': 'TheApp/flowers/images',
    }),
]
