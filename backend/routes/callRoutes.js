import express from 'express';
import {
  createCall,
  getCallById,
  acceptCall,
  rejectCall,
  endCall,
  getUserCalls
} from '../controllers/callController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', createCall);
router.get('/:id', getCallById);
router.patch('/:id/accept', acceptCall);
router.patch('/:id/reject', rejectCall);
router.patch('/:id/end', endCall);
router.get('/user/:userId', getUserCalls);

export default router;
