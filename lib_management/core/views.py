from django.shortcuts import render
from catalogue.models import Book

def home(request):
    featured_books = Book.objects.order_by('-goodreads_rating')[:4]
    total_books = Book.objects.count()
    genres = (
        Book.objects.values_list('genre', flat=True)
        .exclude(genre='')
        .distinct()[:8]
    )
    
    return render(request, 'core/index.html', {
        'featured_books': featured_books,
        'total_books': total_books,
        'genres': genres,
    })