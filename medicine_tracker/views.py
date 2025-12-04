from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Medication, Reminder
from datetime import date,timedelta
from .forms import MedicationForm

def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return redirect("main_menu")
        else:
            error = "Invalid username or password"
            return render(request, "medicine_tracker/login.html", {"error": error})
    return render(request, "medicine_tracker/login.html")


def register_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  
            return redirect("main_menu")
    else:
        form = UserCreationForm()
    return render(request, "medicine_tracker/register.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect("login")



@login_required
def main_menu(request):
    today = date.today()
    reminders = Reminder.objects.filter(date=today, medication__user=request.user)
    return render(request, "medicine_tracker/mainmenu.html", {"reminders": reminders})


@login_required
def medication_list(request):
    meds = Medication.objects.filter(user=request.user)
    return render(request, "medicine_tracker/MedicationList.html", {"medications": meds})



@login_required
def add_medication(request):
    if request.method == "POST":
        form = MedicationForm(request.POST)
        if form.is_valid():
            medication = form.save(commit=False)
            medication.user = request.user
            medication.save()
            start = medication.start_date
            end = medication.end_date
            times = ["08:00", "14:00", "20:00"]  
            current_date = start
            while current_date <= end:
                for t in times:
                    Reminder.objects.create(
                        medication=medication,
                        date=current_date,
                        time=t
                    )
                current_date += timedelta(days=1)

            return redirect("medication_list")
    else:
        form = MedicationForm()

    return render(request, "medicine_tracker/medicine_form.html", {
        "form": form,
        "action": "Add"
    })

@login_required
def edit_medication(request, pk):
    med = get_object_or_404(Medication, pk=pk, user=request.user)

    if request.method == "POST":
        med.name = request.POST["name"]
        med.dosage = request.POST["dosage"]
        med.frequency = request.POST["frequency"]
        med.instructions = request.POST.get("instructions", "")
        med.start_date = request.POST["start_date"]
        med.end_date = request.POST["end_date"]
        med.save()
        return redirect("medication_list")
    else:
        form = MedicationForm(instance=med)
        return render(request, "medicine_tracker/EditMedication.html", { "form": form, "med": med})


@login_required
def delete_medication(request, pk):
    med = get_object_or_404(Medication, pk=pk, user=request.user)
    if request.method == "POST":
        med.delete()
        return redirect("medication_list")
    return render(request, "medicine_tracker/confirm_delete.html", {"med": med})

from django.views.decorators.http import require_POST

@login_required
@require_POST
def schedule_mark_taken(request, pk):
    reminder = get_object_or_404(Reminder, pk=pk, medication__user=request.user)
    reminder.status = 'taken'
    from datetime import datetime
    reminder.taken_at = datetime.now()
    reminder.save()
    return redirect('schedule')

from django.views.decorators.http import require_POST
from django.utils import timezone

@login_required
@require_POST
def schedule_mark_skipped(request, pk):
    reminder = get_object_or_404(Reminder, pk=pk, medication__user=request.user)
    reminder.status = 'skipped'
    reminder.note = request.POST.get('note', '')
    reminder.taken_at = timezone.now()  
    reminder.save()
    return redirect('schedule')



@login_required
def schedule_view(request):
    view_type = request.GET.get('view', 'daily')
    selected_date = request.GET.get('date')
    
    if selected_date:
        selected_date = date.fromisoformat(selected_date)
    else:
        selected_date = date.today()
    
    prev_date = selected_date - timedelta(days=1)
    next_date = selected_date + timedelta(days=1)

    schedules = Reminder.objects.filter(medication__user=request.user, date=selected_date)

    total_scheduled = schedules.count()
    total_taken = schedules.filter(status='taken').count()
    total_skipped = schedules.filter(status='skipped').count()
    total_missed = schedules.filter(status='missed').count()

    context = {
        "view_type": view_type,
        "selected_date": selected_date,
        "prev_date": prev_date,
        "next_date": next_date,
        "schedules": schedules,
        "total_scheduled": total_scheduled,
        "total_taken": total_taken,
        "total_skipped": total_skipped,
        "total_missed": total_missed,
    }


    if view_type == 'daily':
        schedules = Reminder.objects.filter(medication__user=request.user, date=selected_date)
        context["schedules"] = schedules

    elif view_type == 'weekly':
        start_date = selected_date - timedelta(days=selected_date.weekday())
        end_date = start_date + timedelta(days=6)
        week_schedules = {}
        for i in range(7):
            day = start_date + timedelta(days=i)
            day_reminders = Reminder.objects.filter(medication__user=request.user, date=day)
            week_schedules[day] = day_reminders
        context.update({
            "start_date": start_date,
            "end_date": end_date,
            "week_schedules": week_schedules
        })
    
    return render(request, "medicine_tracker/schedule.html", context)

@login_required
def profile_view(request):
    user = request.user
    
    days = 7
    start_date = date.today() - timedelta(days=days)
    
    reminders = Reminder.objects.filter(medication__user=user, date__gte=start_date)
    
    total = reminders.count()
    taken = reminders.filter(status='taken').count()
    skipped = reminders.filter(status='skipped').count()
    missed = reminders.filter(status='missed').count()
    
    adherence_rate = int((taken / total) * 100) if total > 0 else 0
    
    adherence_stats = {
        'total': total,
        'taken': taken,
        'skipped': skipped,
        'missed': missed,
        'adherence_rate': adherence_rate,
        'days': days
    }
    
    return render(request, "medicine_tracker/profile.html", {
        'adherence_stats': adherence_stats
    })
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from django.shortcuts import redirect
from django.contrib.auth.models import User

@login_required
def change_password(request):
    if request.method == 'POST':
        current_password = request.POST.get('current_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')

        if not request.user.check_password(current_password):
            messages.error(request, "Current password is incorrect.")
        elif new_password != confirm_password:
            messages.error(request, "New passwords do not match.")
        elif len(new_password) < 8:
            messages.error(request, "Password must be at least 8 characters long.")
        else:
            request.user.set_password(new_password)
            request.user.save()
            update_session_auth_hash(request, request.user)  
            messages.success(request, "Password changed successfully.")
            return redirect('profile')

    return redirect('profile')
