import { Router, type Router as RouterType } from "express";
import { z } from "zod/v4";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import {
  registerPublisher,
  getPublisherResources,
} from "../services/publisherService.js";

const router: RouterType = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  walletAddress: z.string().min(1),
});

// POST /publishers — register a new publisher (public)
router.post("/publishers", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  try {
    const { publisher, apiKey } = await registerPublisher(parsed.data);
    res.status(201).json({
      id: publisher.id,
      name: publisher.name,
      email: publisher.email,
      walletAddress: publisher.walletAddress,
      apiKey, // shown once — store it securely
      createdAt: publisher.createdAt,
    });
  } catch (err: any) {
    if (err.message?.includes("unique")) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    throw err;
  }
});

// GET /publishers/me — own profile (authenticated)
router.get("/publishers/me", apiKeyAuth, async (req, res) => {
  const pub = req.publisher!;
  res.json({
    id: pub.id,
    name: pub.name,
    email: pub.email,
    walletAddress: pub.walletAddress,
    createdAt: pub.createdAt,
  });
});

// GET /publishers/me/resources — own resources (authenticated)
router.get("/publishers/me/resources", apiKeyAuth, async (req, res) => {
  const resources = await getPublisherResources(req.publisher!.id);
  res.json(resources);
});

export default router;
