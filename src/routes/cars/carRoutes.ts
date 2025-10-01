import { Router } from 'express';
import { CarController } from '../controllers/implementation/cars/carController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const carController = new CarController(/* inject CarService */);

router.get('/admin/verify', authMiddleware, carController.getAllCarsForVerify.bind(carController));
router.get('/admin/verified', authMiddleware, carController.getAllVerifiedCars.bind(carController));
router.patch('/admin/:carId/verify', authMiddleware, carController.updateCarVerifyStatus.bind(carController));
router.patch('/admin/:carId/block', authMiddleware, carController.updateCarBlockStatus.bind(carController));

export default router;



import { Router } from 'express';
import { CarController } from '../controllers/implementation/cars/carController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const carController = new CarController(/* inject CarService */);

router.post('/owner', authMiddleware, carController.uploadCar.bind(carController));
router.get('/owner', authMiddleware, carController.getCarList.bind(carController));
router.patch('/owner/:id/availability', authMiddleware, carController.updateCarAvailability.bind(carController));
router.delete('/owner/:id', authMiddleware, carController.deleteCar.bind(carController));
router.patch('/owner/:id', authMiddleware, carController.updateCar.bind(carController));
router.get('/admin/verify', authMiddleware, carController.getAllCarsForVerify.bind(carController));
router.get('/admin/verified', authMiddleware, carController.getAllVerifiedCars.bind(carController));
router.patch('/admin/:carId/verify', authMiddleware, carController.updateCarVerifyStatus.bind(carController));
router.patch('/admin/:carId/block', authMiddleware, carController.updateCarBlockStatus.bind(carController));

export default router;




import { Router } from 'express';
import { CarController } from '../controllers/implementation/cars/carController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const carController = new CarController(/* inject CarService */);

router.get('/nearby', carController.getNearbyCars.bind(carController));
router.get('/featured', carController.getFeaturedCars.bind(carController));
router.get('/', carController.getAllCars.bind(carController));
router.get('/:carId', carController.getCarDetail.bind(carController));
router.get('/:carId/booked-dates', carController.getBookedDatesCars.bind(carController));
router.post('/owner', authMiddleware, carController.uploadCar.bind(carController));
router.get('/owner', authMiddleware, carController.getCarList.bind(carController));
router.patch('/owner/:id/availability', authMiddleware, carController.updateCarAvailability.bind(carController));
router.delete('/owner/:id', authMiddleware, carController.deleteCar.bind(carController));
router.patch('/owner/:id', authMiddleware, carController.updateCar.bind(carController));
router.get('/admin/verify', authMiddleware, carController.getAllCarsForVerify.bind(carController));
router.get('/admin/verified', authMiddleware, carController.getAllVerifiedCars.bind(carController));
router.patch('/admin/:carId/verify', authMiddleware, carController.updateCarVerifyStatus.bind(carController));
router.patch('/admin/:carId/block', authMiddleware, carController.updateCarBlockStatus.bind(carController));

export default router;