from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    reliability_score = models.FloatField(default=50.0)
    total_rentals = models.PositiveIntegerField(default=0)
    on_time_returns = models.PositiveIntegerField(default=0)
    late_returns = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.user.username



    @receiver(post_save, sender=User)
    def create_customer_profile(sender, instance, created, **kwargs):
        if created:
            CustomerProfile.objects.create(user=instance)