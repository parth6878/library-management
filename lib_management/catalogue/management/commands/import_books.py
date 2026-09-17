import csv
from django.core.management.base import BaseCommand
from catalogue.models import Book

class Command(BaseCommand):
    help = "Import books from data.csv"

    def handle(self, *args, **kwargs):
        with open('data/data.csv', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                if count >= 300:
                    break
                if not row.get('title'):
                    continue

                Book.objects.create(
                    title=row['title'][:300],
                    authors=(row.get('authors') or 'Unknown')[:300],
                    genre=(row.get('categories') or 'General')[:150],
                    description=row.get('description') or '',
                    cover_url=row.get('thumbnail') or '',
                    goodreads_rating=float(row.get('average_rating') or 0),
                )
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Imported {count} books'))