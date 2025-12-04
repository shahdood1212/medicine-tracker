from django import forms
from .models import Medication

class MedicationForm(forms.ModelForm):
    class Meta:
        model = Medication
        fields = ["name", "dosage", "frequency", "instructions", "start_date", "end_date"]

        widgets = {
            "start_date": forms.DateInput(
                attrs={"type": "date", "class": "form-control"}
            ),
            "end_date": forms.DateInput(
                attrs={"type": "date", "class": "form-control"}
            ),
            "name": forms.TextInput(attrs={"class": "form-control"}),
            "dosage": forms.TextInput(attrs={"class": "form-control"}),
            "frequency": forms.TextInput(attrs={"class": "form-control"}),
            "instructions": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
        }
