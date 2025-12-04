
from django.contrib import admin
from django.urls import path
from medicine_tracker import views
urlpatterns = [
   path('login/', views.login_view, name='login'),
   path('logout/', views.logout_view, name='logout'),
    path('', views.register_view, name='register'),
    path('dashboard/', views.main_menu, name='main_menu'),
    path('medications/', views.medication_list, name='medication_list'),  
    path('medications/add/', views.add_medication, name='medicine_add'),
    path('medications/<int:pk>/edit/', views.edit_medication, name='edit_medication'),
    path('medications/<int:pk>/delete/', views.delete_medication, name='medicine_delete'),
    path('schedule/<int:pk>/taken/', views.schedule_mark_taken, name='schedule_mark_taken'),
    path('schedule/<int:pk>/skipped/', views.schedule_mark_skipped, name='schedule_mark_skipped'),
    path('schedule/', views.schedule_view, name='schedule'),
    path('change-password/', views.change_password, name='change_password'),
    path('profile/', views.profile_view, name='profile'),
]
