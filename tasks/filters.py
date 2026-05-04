import django_filters
from .models import Task


class TaskFilter(django_filters.FilterSet):
    """
    Allows filtering tasks via query params:
    ?status=todo
    ?priority=high
    ?assigned_to=3
    ?overdue=true   ← custom filter
    """

    overdue = django_filters.BooleanFilter(method="filter_overdue", label="Overdue")

    def filter_overdue(self, queryset, name, value):
        from django.utils import timezone
        today = timezone.now().date()
        if value:
            return queryset.filter(due_date__lt=today).exclude(status=Task.Status.DONE)
        return queryset

    class Meta:
        model = Task
        fields = ["status", "priority", "assigned_to", "project"]