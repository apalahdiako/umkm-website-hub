import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

const payloadSchema = z.object({
  reference_id: z.string().min(4).max(60).optional(),
  order_code: z.string().min(4).max(60).optional(),
  status: z.string().min(2).max(40),
  amount: z.number().optional(),
  reference: z.string().max(120).optional(),
});

function verify(signature: string | null, rawBody: string, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature.replace(/^sha256=/, ""));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/webhook/payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYMENT_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook secret not configured", { status: 500 });

        const raw = await request.text();
        const signature =
          request.headers.get("x-callback-signature") ??
          request.headers.get("x-signature") ??
          request.headers.get("x-webhook-signature");

        if (!verify(signature, raw, secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const parsed = payloadSchema.safeParse(JSON.parse(raw));
        if (!parsed.success) return new Response("Invalid payload", { status: 400 });

        const code = parsed.data.order_code ?? parsed.data.reference_id;
        if (!code) return new Response("Missing order reference", { status: 400 });

        const normalized = parsed.data.status.toLowerCase();
        const status = ["paid", "success", "settled", "settlement", "completed"].includes(
          normalized,
        )
          ? "paid"
          : ["expired", "failed", "cancelled", "canceled", "deny"].includes(normalized)
            ? "failed"
            : "pending";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: status,
            paid_at: status === "paid" ? new Date().toISOString() : null,
            payment_reference: parsed.data.reference ?? null,
          })
          .eq("order_code", code);

        if (error) {
          console.error("Webhook update failed:", error.message);
          return new Response("Update failed", { status: 500 });
        }

        return Response.json({ ok: true, order_code: code, status });
      },
    },
  },
});
