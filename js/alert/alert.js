const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
    apple: 'y'
};

function showAlert(type = 'success', title = 'Success', message = '', duration = 3000) {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-icon">${icons[type]}</div>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <button class="alert-close" onclick="closeAlert(this)">×</button>
        <div class="alert-progress"></div>
    `;
    container.appendChild(alert);

    setTimeout(() => {
        closeAlert(alert.querySelector('.alert-close'));
    }, duration);
}

function closeAlert(button) {
    const alert = button.closest('.alert');
    alert.classList.add('hiding');
    setTimeout(() => {
        alert.remove();
    }, 300);
}
