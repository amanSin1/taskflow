web: gunicorn core.wsgi:application --bind [::]:$PORT --workers 2
release: python manage.py migrate --no-input && python manage.py collectstatic --no-input