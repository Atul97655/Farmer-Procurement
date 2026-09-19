import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const notificationsRouter = Router();

/**
 * Get notifications for user or role
 */
notificationsRouter.get('/', (req: Request, res: Response) => {
  const { userId, role } = req.query;

  let items = db.notifications.find();

  if (userId) {
    items = items.filter(n => n.userId === userId || n.userId === 'ALL');
  } else if (role) {
    items = items.filter(n => n.role === role || n.role === 'ALL');
  }

  return res.json({ success: true, count: items.length, notifications: items });
});

/**
 * Mark notification as read
 */
notificationsRouter.patch('/:id/read', (req: Request, res: Response) => {
  const updated = db.notifications.update(req.params.id, { isRead: true });
  if (!updated) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  return res.json({ success: true, notification: updated });
});

/**
 * Mark all notifications as read
 */
notificationsRouter.post('/read-all', (req: Request, res: Response) => {
  const { userId } = req.body;
  db.notifications.markAllAsRead(userId);
  return res.json({ success: true, message: 'All notifications marked as read' });
});
