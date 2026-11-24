const Activity = require('../models/mongo/activity.model');
const Notification = require('../models/mongo/notification.model');

const NotificationService = {

  // Log activity to MongoDB
  logActivity: async (groupId, userId, action, message, metadata = {}) => {
    try {
      await Activity.create({
        groupId,
        userId,
        action,
        message,
        metadata
      });
    } catch (error) {
      console.error('Activity log failed:', error.message);
    }
  },

  // Send notification to specific users
  sendNotification: async (userIds, groupId, message, type) => {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        groupId,
        message,
        type
      }));
      await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Notification send failed:', error.message);
    }
  },

  // Get notifications for a user
  getUserNotifications: async (userId) => {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
  },

  // Get activity feed for a group
  getGroupActivity: async (groupId) => {
    return await Activity.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(50);
  },

  // Mark all notifications as read
  markAllRead: async (userId) => {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  },

  // Count unread notifications
  countUnread: async (userId) => {
    return await Notification.countDocuments({
      userId,
      isRead: false
    });
  }

};

module.exports = NotificationService;