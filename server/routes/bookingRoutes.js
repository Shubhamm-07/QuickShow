import express from 'express';
import { checkPaymentStatus, createBooking, getOccupiedSeats } from '../controllers/bookingController.js';

const bookingRouter = express.Router()


bookingRouter.post('/create', createBooking)
bookingRouter.get('/seats/:showId', getOccupiedSeats)
// In your booking routes
bookingRouter.get('/check-status/:bookingId', checkPaymentStatus);

export default bookingRouter;