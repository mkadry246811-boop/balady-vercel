/**
 * Islamic Reminder System
 * Shows a beautiful reminder notification every 15 minutes
 */

(function() {
    // Reminder messages
    var reminders = [
        'صلِّ على محمد ﷺ',
        'اللهم صلِّ وسلم على نبينا محمد ﷺ',
        'صلى الله عليه وسلم ﷺ',
        'اللهم صلِّ على محمد وعلى آل محمد ﷺ'
    ];

    // Create notification element
    function createNotification() {
        if (document.getElementById('islamic-reminder')) return;

        var notification = document.createElement('div');
        notification.id = 'islamic-reminder';
        notification.innerHTML =
            '<div class="reminder-content">' +
                '<div class="reminder-icon">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor">' +
                        '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="reminder-text">' +
                    '<span class="reminder-title">تذكير</span>' +
                    '<span class="reminder-message"></span>' +
                '</div>' +
                '<button class="reminder-close" id="reminder-close-btn">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor">' +
                        '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6���q�^