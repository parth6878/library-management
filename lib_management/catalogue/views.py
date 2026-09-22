from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q
from .models import Book

def book_list(request):
    query = request.GET.get('q', '').strip()
    selected_genre = request.GET.get('genre', '').strip()
    sort_by = request.GET.get('sort', 'rating')

    books = Book.objects.all()

    # Search filter
    if query:
        books = books.filter(
            Q(title__icontains=query) |
            Q(authors__icontains=query) |
            Q(genre__icontains=query)
        )

    # Genre filter
    if selected_genre:
        books = books.filter(genre__iexact=selected_genre)

    # Sorting
    if sort_by == 'price_asc':
        books = books.order_by('rental_price')
    elif sort_by == 'price_desc':
        books = books.order_by('-rental_price')
    elif sort_by == 'title':
        books = books.order_by('title')
    else:  # default highest rating
        books = books.order_by('-goodreads_rating', 'title')

    # Get distinct genres for the filter pill bar
    genres = (
        Book.objects.values_list('genre', flat=True)
        .exclude(genre='')
        .distinct()[:10]
    )

    # Pagination: 16 books per page
    paginator = Paginator(books, 16)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, 'catalogue/book_list.html', {
        'page_obj': page_obj,
        'books': page_obj.object_list,
        'total_count': paginator.count,
        'query': query,
        'selected_genre': selected_genre,
        'sort_by': sort_by,
        'genres': genres,
    })

def book_detail(request, pk):
    book = get_object_or_404(Book, pk=pk)
    # Related books from the same genre
    related_books = (
        Book.objects.filter(genre=book.genre)
        .exclude(pk=book.pk)
        .order_by('-goodreads_rating')[:4]
    )
    
    return render(request, 'catalogue/book_detail.html', {
        'book': book,
        'related_books': related_books
    })