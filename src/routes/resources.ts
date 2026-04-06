import { Router, type Router as RouterType } from "express";
import multer from "multer";
import { z } from "zod/v4";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import {
  createFileResource,
  createLinkResource,
  listCatalog,
  getResourceMeta,
  delistResource,
} from "../services/resourceService.js";
import { config } from "../config.js";

const router: RouterType = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const linkSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.string().min(1),
  walletAddress: z.string().optional(),
  externalUrl: z.url(),
});

// POST /resources — publish a resource (authenticated)
router.post("/resources", apiKeyAuth, upload.single("file"), async (req, res) => {
  const publisher = req.publisher!;

  // File upload
  if (req.file) {
    const { title, description, price, walletAddress } = req.body;

    if (!title || !price) {
      res.status(400).json({ error: "title and price are required" });
      return;
    }

    const resource = await createFileResource({
      publisherId: publisher.id,
      title,
      description,
      price,
      walletAddress: walletAddress || publisher.walletAddress,
      fileBuffer: req.file.buffer,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    res.status(201).json(resource);
    return;
  }

  // Link resource
  const parsed = linkSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const resource = await createLinkResource({
    publisherId: publisher.id,
    title: parsed.data.title,
    description: parsed.data.description,
    price: parsed.data.price,
    walletAddress: parsed.data.walletAddress || publisher.walletAddress,
    externalUrl: parsed.data.externalUrl,
  });

  res.status(201).json(resource);
});

// GET /resources — browse catalog (public)
router.get("/resources", async (_req, res) => {
  const catalog = await listCatalog();
  res.json(catalog);
});

// GET /resources/:id/meta — resource preview (public)
router.get("/resources/:id/meta", async (req, res) => {
  const meta = await getResourceMeta(req.params.id as string);
  if (!meta) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  res.json(meta);
});

// DELETE /resources/:id — delist a resource (authenticated, owner only)
router.delete("/resources/:id", apiKeyAuth, async (req, res) => {
  const resource = await delistResource(req.params.id as string, req.publisher!.id);
  if (!resource) {
    res.status(404).json({ error: "Resource not found or not owned by you" });
    return;
  }
  res.json({ message: "Resource delisted", id: resource.id });
});

export default router;
