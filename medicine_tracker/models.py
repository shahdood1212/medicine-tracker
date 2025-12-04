from django.db import models
from django.contrib.auth.models import User

class Medication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    frequency = models.CharField(max_length=50)  
    instructions = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.name


class Reminder(models.Model):
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=[('scheduled', 'Scheduled'), ('taken', 'Taken'),
                 ('skipped', 'Skipped'), ('missed', 'Missed')],
        default='scheduled'
    )
    note = models.TextField(blank=True, null=True)
    date = models.DateField()
    taken_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.medication.name} - {self.time}"
