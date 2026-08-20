from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import CustomerProfile

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'reliability_score', 'total_rentals', 'on_time_returns', 'late_returns')