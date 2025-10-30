const pusher = require('../config/pusher');
const Notification = require('../models/notification');

class NotificationService {
  // Create and send notification
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();

      // Send real-time notification via Pusher
      await pusher.trigger(
        `private-user-${notificationData.userId}`,
        'new-notification',
        {
          notification: notification.toObject()
        }
      );

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId, page = 1, limit = 20) {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    return { notifications, unreadCount };
  }

  // Mark as read
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (notification) {
      await pusher.trigger(
        `private-user-${userId}`,
        'notification-read',
        { notificationId }
      );
    }

    return notification;
  }

  // Mark all as read
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    await pusher.trigger(
      `private-user-${userId}`,
      'all-notifications-read',
      {}
    );
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    const result = await Notification.deleteOne({ 
      _id: notificationId, 
      userId 
    });

    if (result.deletedCount > 0) {
      await pusher.trigger(
        `private-user-${userId}`,
        'notification-deleted',
        { notificationId }
      );
    }

    return result;
  }
}

module.exports = new NotificationService();