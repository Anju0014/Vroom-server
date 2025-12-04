import express, { Request, Response, Router } from 'express';
import { generatePresignedUrl } from '../../services/s3Service';

const router: Router = express.Router();

router.post('/generatePresignedUrl', async (req: Request, res: Response): Promise<void> => {
  console.log('jjukk');
  const { fileName, fileType } = req.body;
  if (!fileName || !fileType) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }
  try {
    const { url, key } = await generatePresignedUrl(fileName, fileType);
    res.json({ url, key });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate URL' });
  }
});

export default router;
