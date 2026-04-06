import { Router, type Router as RouterType } from "express";
import {
  paymentMiddleware,
  x402ResourceServer,
} from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactStellarScheme } from "@x402/stellar/exact/server";
import type { Network } from "@x402/core/types";
import type { RoutesConfig } from "@x402/core/server";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { resources, verifications } from "../db/schema.js";
import { checkOriginality } from "../services/verificationService.js";
import { config } from "../config.js";

const router: RouterType = Router();
const network = config.NETWORK as Network;

const facilitatorClient = new HTTPFacilitatorClient({
  url: config.FACILITATOR_URL,
});

const resourceServer = new x402ResourceServer(facilitatorClient).register(
  network,
  new ExactStellarScheme()
);

const verifyRoutes: RoutesConfig = {
  "POST /verify-content": {
    accepts: {
      scheme: "exact" as const,
      network,
      payTo: config.PAY_TO,
      price: `$${config.VERIFICATION_PRICE}`,
    },
    description: "AI content originality verification",
  },
};

const verifyPaywall = paymentMiddleware(verifyRoutes, resourceServer);

// POST /verify-content — AI originality check (x402 paywalled)
router.post("/verify-content", verifyPaywall, async (req, res) => {
  const { content, resourceId } = req.body;

  if (!content) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const result = await checkOriginality(content, "text");

  // If a resourceId is provided, save the verification result
  if (resourceId) {
    const [verification] = await db
      .insert(verifications)
      .values({
        resourceId,
        isOriginal: result.isOriginal,
        confidence: result.confidence,
        flags: JSON.stringify(result.flags),
      })
      .returning();

    // Update resource status
    await db
      .update(resources)
      .set({
        verificationStatus: result.isOriginal ? "verified" : "rejected",
        verificationId: verification.id,
        listed: result.isOriginal,
      })
      .where(eq(resources.id, resourceId));
  }

  res.json(result);
});

export default router;
