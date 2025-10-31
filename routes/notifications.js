const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');


const controller = require('../controllers/notifications')

// Get all notifications
router.get('/', isLoggedIn, controller.allNotifications);

// Get unread count
router.get('/unread-count', isLoggedIn, controller.unreadCount);

// Mark as read
router.patch('/:id/read', isLoggedIn, controller.markAsRead);

// Mark all as read
router.patch('/read-all', isLoggedIn, controller.readAll);

// Delete notification
router.delete('/:id', isLoggedIn, controller.deleteNotifications);

// Pusher authentication endpoint
router.post('/pusher/auth', isLoggedIn, controller.pusherAuth);

module.exports = router;