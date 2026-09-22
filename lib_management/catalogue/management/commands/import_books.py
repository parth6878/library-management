import csv
from django.core.management.base import BaseCommand
from catalogue.models import Book

class Command(BaseCommand):
    help = "Import books from data.csv (up to 1,000 books)"

    def handle(self, *args, **kwargs):
        # Clear existing books to avoid duplicate entries
        Book.objects.all().delete()

        books_to_create = []
        with open('data/data.csv', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                if count >= 1000:
                    break
                if not row.get('title'):
                    continue

                try:
                    rating = float(row.get('average_rating') or 0)
                except (ValueError, TypeError):
                    rating = 0.0

                books_to_create.append(
                    Book(
                        title=row['title'][:300],
                        authors=(row.get('authors') or 'Unknown')[:300],
                        genre=(row.get('categories') or 'General')[:150],
                        description=row.get('description') or '',
                        cover_url=row.get('thumbnail') or '',
                        goodreads_rating=rating,
                    )
                )
                count += 1

        Book.objects.bulk_create(books_to_create, batch_size=500)
        self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(books_to_create)} books into the catalogue!'))