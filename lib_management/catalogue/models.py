from django.db import models

# Create your models here.

class Book(models.Model):
    title = models.CharField(max_length=300)
    authors = models.CharField(max_length=300, blank=True, default="Unknown")
    genre = models.CharField(max_length=150, blank=True, default="General")
    description = models.TextField(blank=True)
    cover_url = models.URLField(blank=True, null=True)
    goodreads_rating = models.FloatField(default=0)
    avg_rating = models.FloatField(default=0)
    rental_price = models.DecimalField(max_digits=6, decimal_places=2, default=50.00)
    stock = models.PositiveIntegerField(default=5)

    def __str__(self):
        return self.title