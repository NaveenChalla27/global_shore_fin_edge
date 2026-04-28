// Centralised route table. Add a new endpoint here, point it at a controller.
import {Router} from "express";
import * as countries from "../controllers/countryController.js";
import * as contacts from "../controllers/contactController.js";
import * as posts from "../controllers/postController.js";
import * as bookings from "../controllers/bookingController.js";
import * as testimonials from "../controllers/testimonialController.js";
import * as auth from "../controllers/authController.js";
import * as health from "../controllers/healthController.js";
import {requireAuth} from "../middleware/authMiddleware.js";

const router = Router();

// Health
router.get("/health", health.get);

// Countries
router.get("/countries", countries.list);
router.post("/countries", countries.create);
router.get("/countries/:code", countries.getOne);
router.put("/countries/:code", countries.update);
router.delete("/countries/:code", countries.remove);

// Nested services
router.post("/countries/:code/services", countries.addService);
router.put("/countries/:code/services/:key", countries.updateService);
router.delete("/countries/:code/services/:key", countries.removeService);

// Contacts
router.get("/contacts", contacts.get);
router.put("/contacts", contacts.update);

// Blog posts
router.get("/posts", posts.list);
router.post("/posts", posts.create);
router.get("/posts/:slug", posts.getOne);
router.put("/posts/:slug", posts.update);
router.delete("/posts/:slug", posts.remove);

// Auth
router.post("/auth/login", auth.login);
router.get("/auth/me", requireAuth, auth.me);
router.post("/auth/logout", auth.logout);

// Consultation bookings (list is admin-only)
router.get("/bookings", requireAuth, bookings.list);
router.post("/bookings", bookings.create);

// Testimonials
router.get("/testimonials", testimonials.list);
router.post("/testimonials", testimonials.create);
router.get("/testimonials/:id", testimonials.getOne);
router.put("/testimonials/:id", testimonials.update);
router.delete("/testimonials/:id", testimonials.remove);

export default router;
