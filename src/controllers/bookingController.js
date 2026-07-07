// HTTP layer for /api/bookings.
import * as svc from "../services/bookingService.js";
import {asyncHandler} from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
    const country = req.query.country?.toUpperCase() ?? null;
    res.json({bookings: await svc.listBookings(country)});
});

export const create = asyncHandler(async (req, res) => {
    res.status(201).json(await svc.createBooking(req.body));
});
