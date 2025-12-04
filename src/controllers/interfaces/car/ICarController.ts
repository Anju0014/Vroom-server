import { Request, Response } from 'express';

interface ICarController {
  uploadCar(req: Request, res: Response): Promise<void>;
  getCarList(req: Request, res: Response): Promise<void>;
  deleteCar(req: Request, res: Response): Promise<void>;
  updateCar(req: Request, res: Response): Promise<void>;
}

export default ICarController