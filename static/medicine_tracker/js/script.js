
let notificationPermission = false;
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
function initializeApp() {
    requestNotificationPermission();
    initializeTooltips();
    initializePopovers();
    addFadeInAnimation();
    setupFormValidation();
    setupConfirmationDialogs();
    setupAutoDismissAlerts();
    setupSearchFunctionality();
    setupKeyboardShortcuts();
    initializeCustomComponents();
}
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                notificationPermission = (permission === 'granted');
            });
        } else if (Notification.permission === 'granted') {
            notificationPermission = true;
        }
    }
}

function showNotification(title, options = {}) {
    if (notificationPermission && 'Notification' in window) {
        const notification = new Notification(title, {
            icon: '/static/medicine_tracker/img/icon.png',
            badge: '/static/medicine_tracker/img/badge.png',
            ...options
        });

        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        return notification;
    }
}
function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}
function initializePopovers() {
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
}
function addFadeInAnimation() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}
function setupFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}
function setupConfirmationDialogs() {
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm-message') || 
                          'Are you sure you want to delete this item?';
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });
    const confirmForms = document.querySelectorAll('[data-confirm-submit]');
    confirmForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const message = this.getAttribute('data-confirm-message') || 
                          'Are you sure you want to submit this form?';
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });
}
function setupAutoDismissAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000); 
    });
}function setupSearchFunctionality() {
    const searchInputs = document.querySelectorAll('[data-search-target]');   
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const targetSelector = this.getAttribute('data-search-target');
            const searchTerm = this.value.toLowerCase();
            const targets = document.querySelectorAll(targetSelector);
            targets.forEach(target => {
                const text = target.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    target.style.display = '';
                } else {
                    target.style.display = 'none';
                }
            });
        });
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"], input[name="search"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const addButton = document.querySelector('[href*="medicine_add"]');
            if (addButton) {
                addButton.click();
            }
        }
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            });
        }
    });
}
function initializeCustomComponents() {
    initializeMedicationCards();
    initializeDataTables();
    initializeDatePickers();
    initializeCustomDialogs();
}
function initializeMedicationCards() {
    const medicationCards = document.querySelectorAll('.medicine-card');    
    medicationCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        const cardBody = card.querySelector('.card-body');
        if (cardBody) {
            const instructions = cardBody.querySelector('.alert');
            if (instructions && instructions.textContent.length > 100) {
                instructions.style.cursor = 'pointer';
                instructions.title = 'Click to expand';
                
                instructions.addEventListener('click', function() {
                    if (this.style.maxHeight) {
                        this.style.maxHeight = null;
                    } else {
                        this.style.maxHeight = this.scrollHeight + 'px';
                    }
                });
            }
        }
    });
}
function initializeDataTables() {
    const tables = document.querySelectorAll('table.table');    
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.style.cursor = 'pointer';
            
            row.addEventListener('click', function(e) {
                if (e.target.closest('button') || e.target.closest('form') || e.target.closest('a')) {
                    return;
                }
                rows.forEach(r => r.classList.remove('table-active'));
                this.classList.add('table-active');
            });
        });
        const headers = table.querySelectorAll('thead th');
        headers.forEach((header, index) => {
            if (!header.classList.contains('no-sort')) {
                header.style.cursor = 'pointer';
                header.title = 'Click to sort';
                
                header.addEventListener('click', function() {
                    sortTable(table, index);
                });
            }
        });
    });
}

function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isAscending = table.getAttribute('data-sort-dir') !== 'asc';
    
    rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();
        
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? aNum - bNum : bNum - aNum;
        }
        return isAscending ? 
            aValue.localeCompare(bValue) : 
            bValue.localeCompare(aValue);
    });
    
    rows.forEach(row => tbody.appendChild(row));
    table.setAttribute('data-sort-dir', isAscending ? 'asc' : 'desc');
}

function initializeDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        if (input.hasAttribute('data-future-only')) {
            const today = new Date().toISOString().split('T')[0];
            input.setAttribute('min', today);
        }
        if (!input.previousElementSibling || 
            !input.previousElementSibling.classList.contains('input-group-text')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-group';
            input.parentNode.insertBefore(wrapper, input);            
            const icon = document.createElement('span');
            icon.className = 'input-group-text';
            icon.innerHTML = '<i class="bi bi-calendar"></i>';
            wrapper.appendChild(icon);
            wrapper.appendChild(input);
        }
    });
}

function initializeCustomDialogs() {
    window.showDialog = function(title, message, type = 'info', callback = null) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-${type} text-white">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        ${callback ? '<button type="button" class="btn btn-' + type + '" id="dialogConfirm">Confirm</button>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        if (callback) {
            modal.querySelector('#dialogConfirm').addEventListener('click', function() {
                callback();
                bsModal.hide();
            });
        }
        
        modal.addEventListener('hidden.bs.modal', function() {
            modal.remove();
        });
    };
}
class MedicineReminder {
    constructor() {
        this.reminders = [];
        this.checkInterval = null;
    }

    addReminder(medicineId, medicineName, time, dosage) {
        this.reminders.push({
            id: medicineId,
            name: medicineName,
            time: time,
            dosage: dosage,
            notified: false
        });
    }

    startChecking() {
        this.checkInterval = setInterval(() => {
            this.checkReminders();
        }, 60000);
        
        this.checkReminders();
    }

    checkReminders() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        this.reminders.forEach(reminder => {
            if (reminder.time === currentTime && !reminder.notified) {
                this.notifyReminder(reminder);
                reminder.notified = true;
                
                setTimeout(() => {
                    reminder.notified = false;
                }, 300000);
            }
        });
    }

    notifyReminder(reminder) {
        showNotification(`Time to take ${reminder.name}`, {
            body: `Dosage: ${reminder.dosage}`,
            tag: `medicine-${reminder.id}`,
            requireInteraction: true
        });
        
        showInAppNotification(reminder);
        
        playNotificationSound();
    }

    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

function showInAppNotification(reminder) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 end-0 m-3';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        <strong><i class="bi bi-bell"></i> Medication Reminder</strong><br>
        Time to take <strong>${reminder.name}</strong><br>
        Dosage: ${reminder.dosage}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 30000);
}
function playNotificationSound() {
    const audio = new Audio('/static/medicine_tracker/sounds/notification.mp3');
    audio.play().catch(e => console.log('Could not play notification sound'));
}
function showLoading() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'spinner-overlay';
    overlay.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
window.MedicineTracker = {
    showDialog,
    showLoading,
    hideLoading,
    formatDate,
    formatTime,
    MedicineReminder
};


if (window.location.pathname.includes('dashboard')) {
    const reminderSystem = new MedicineReminder();
    reminderSystem.startChecking();
}