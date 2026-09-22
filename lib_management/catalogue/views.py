from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse
from .models import Book

def book_list(request):
    query = request.GET.get('q', '').strip()
    search_by = request.GET.get('search_by', 'all').strip()
    selected_genre = request.GET.get('genre', '').strip()
    sort_by = request.GET.get('sort', 'rating')

    books = Book.objects.all()

    # Enhanced search targeting Title and/or Author
    if query:
        terms = query.split()
        q_filter = Q()
        if search_by == 'title':
            for term in terms:
                q_filter &= Q(title__icontains=term)
        elif search_by == 'author':
            for term in terms:
                q_filter &= Q(authors__icontains=term)
        else:  # default 'all': matches across both title and author
            for term in terms:
                q_filter &= (Q(title__icontains=term) | Q(authors__icontains=term))

        books = books.filter(q_filter)

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
        'search_by': search_by,
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

def api_search(request):
    """
    Fast JSON search endpoint for live autocomplete suggestions
    searches simultaneously by author and book title
    """
    query = request.GET.get('q', '').strip()
    search_by = request.GET.get('search_by', 'all').strip()

    if not query or len(query) < 2:
        return JsonResponse({'results': []})

    terms = query.split()
    q_filter = Q()
    if search_by == 'title':
        for term in terms:
            q_filter &= Q(title__icontains=term)
    elif search_by == 'author':
        for term in terms:
            q_filter &= Q(authors__icontains=term)
    else:
        for term in terms:
            q_filter &= (Q(title__icontains=term) | Q(authors__icontains=term))

    books = Book.objects.filter(q_filter)[:7]
    data = [
        {
            'id': b.id,
            'title': b.title,
            'authors': b.authors,
            'genre': b.genre,
            'cover_url': b.cover_url or '',
            'price': str(b.rental_price),
            'rating': b.goodreads_rating,
        }
        for b in books
    ]
    return JsonResponse({'results': data})