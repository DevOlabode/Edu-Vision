const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { isLoggedIn } = require('../middleware');
const pusher = require('../config/pusher');

// Get all notifications
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await notificationService.getUserNotifications(
      req.user._id, 
      page, 
      limit
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread-count', isLoggedIn, async (req, res) => {
  try {
    const Notification = require('../models/notification');
    const count = await Notification.countDocuments({ 
      userId: req.user._id, 
      read: false 
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.patch('/:id/read', isLoggedIn, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id, 
      req.user._id
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.patch('/read-all', isLoggedIn, async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', isLoggedIn, async (req, res) => {
  try {
    const result = await notificationService.deleteNotification(
      req.params.id, 
      req.user._id
    );
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pusher authentication endpoint
router.post('/pusher/auth', isLoggedIn, (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  
  const expectedChannel = `private-user-${req.user._id}`;
  if (channel !== expectedChannel) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const authResponse = pusher.authorizeChannel(socketId, channel);
  res.send(authResponse);
});

module.exports = router;