import { Router } from 'express';
import NotificationController from '../../controllers/implementation/notification/notificationController';
import NotificationService from '../../services/implementation/notification/notificationServices';
import NotificationRepository from '../../repositories/implementation/notification/notificationRepository';
const notificationRouter = Router();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

notificationRouter.post('/', (req, res) => notificationController.createNotification(req, res));

notificationRouter.get('/', (req, res) => notificationController.getByUser(req, res));

notificationRouter.patch('/:id/read', (req, res) => notificationController.markAsRead(req, res));

notificationRouter.get('/unread-count', (req, res) =>
  notificationController.getUnreadCount(req, res)
);

export default notificationRouter;
