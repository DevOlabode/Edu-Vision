class NotificationManager {
  constructor() {
    this.pusher = null;
    this.channel = null;
    this.notifications = [];
    this.unreadCount = 0;
    this.init();
  }

  async init() {
    // Initialize Pusher
    this.pusher = new Pusher(window.PUSHER_KEY, {
      cluster: window.PUSHER_CLUSTER,
      authEndpoint: '/api/notifications/pusher/auth',
      auth: {
        headers: {
          'X-CSRF-Token': this.getCsrfToken()
        }
      }
    });

    // Subscribe to user's private channel
    this.channel = this.pusher.subscribe(`private-user-${window.currentUserId}`);

    // Listen for events
    this.channel.bind('new-notification', (data) => {
      this.handleNewNotification(data.notification);
    });

    this.channel.bind('notification-read', (data) => {
      this.markNotificationAsRead(data.notificationId);
    });

    this.channel.bind('all-notifications-read', () => {
      this.markAllAsRead();
    });

    this.channel.bind('notification-deleted', (data) => {
      this.removeNotification(data.notificationId);
    });

    // Load initial notifications
    await this.loadNotifications();
  }

  async loadNotifications() {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      this.notifications = data.notifications;
      this.unreadCount = data.unreadCount;
      this.updateUI();
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  handleNewNotification(notification) {
    this.notifications.unshift(notification);
    this.unreadCount++;
    this.updateUI();
    this.showToast(notification);
    this.playSound();
  }

  markNotificationAsRead(notificationId) {
    const notification = this.notifications.find(n => n._id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.updateUI();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => {
      n.read = true;
      n.readAt = new Date().toISOString();
    });
    this.unreadCount = 0;
    this.updateUI();
  }

  removeNotification(notificationId) {
    const index = this.notifications.findIndex(n => n._id === notificationId);
    if (index !== -1) {
      if (!this.notifications[index].read) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      this.notifications.splice(index, 1);
      this.updateUI();
    }
  }

  updateUI() {
    // Update badge
    const badge = document.getElementById('notificationBadge');
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  renderNotifications(container) {
    if (this.notifications.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-muted">
          <i class="fas fa-bell-slash fa-2x mb-2"></i>
          <p class="mb-0">No notifications yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.notifications.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n._id}">
        <div class="notification-icon">${n.icon}</div>
        <div class="notification-content" onclick="notificationManager.handleClick('${n._id}', '${n.link}')">
          <div class="notification-title">${n.title}</div>
          <div class="notification-message">${n.message}</div>
          <div class="notification-time">${this.formatTime(n.createdAt)}</div>
        </div>
        <div class="notification-actions">
          ${!n.read ? `<button onclick="notificationManager.markAsRead('${n._id}')" class="btn-mark-read" title="Mark as read"><i class="fas fa-check"></i></button>` : ''}
          <button onclick="notificationManager.deleteNotification('${n._id}')" class="btn-delete" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  async handleClick(notificationId, link) {
    await this.markAsRead(notificationId);
    if (link && link !== 'null') {
      window.location.href = link;
    }
  }

  async markAsRead(notificationId) {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  async deleteNotification(notificationId) {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  showToast(notification) {
    // You can use a toast library or create custom toast
    alert(`${notification.title}\n${notification.message}`);
  }

  playSound() {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Could not play sound:', e));
  }

  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  }
}

// Initialize when DOM is ready
let notificationManager;
document.addEventListener('DOMContentLoaded', () => {
  if (window.currentUserId) {
    notificationManager = new NotificationManager();
  }
});