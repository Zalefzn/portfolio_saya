// Web Push for the chat admin.
//
//   GET  → { publicKey }  VAPID public key for /admin/ to subscribe with
//          (generated and stored on first use; it is not a secret)
//   POST → called by the messages_notify_admin trigger for each visitor
//          message; authenticated with the x-webhook-secret header and sends
//          a notification to every device the owner enabled.
//
// All keys live in the database (see the push_keys migration), so the
// function needs no secrets of its own besides the built-in service role.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const VAPID_SUBJECT = "mailto:rizalfauzan190@gmail.com";

// projects on the new API keys expose SUPABASE_SECRET_KEYS (a JSON map);
// older ones only have the legacy service role JWT
function serverKey(): string {
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    const first = Object.values(keys).find((v) => typeof v === "string");
    if (first) return first as string;
  } catch { /* fall through */ }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
}

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serverKey(), {
  auth: { persistSession: false },
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-webhook-secret, authorization, apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

type PushConfig = { webhook_secret: string | null; public_key: string | null; private_key: string | null };

async function loadConfig(): Promise<PushConfig> {
  const { data, error } = await supabase.rpc("chat_push_config");
  if (error) throw error;
  if (data.public_key) return data;

  const keys = webpush.generateVAPIDKeys();
  const { error: saveError } = await supabase.rpc("chat_save_push_keys", {
    public_key: keys.publicKey,
    private_key: keys.privateKey,
  });
  if (saveError) throw saveError;

  // re-read: another instance may have saved its pair first
  const again = await supabase.rpc("chat_push_config");
  if (again.error) throw again.error;
  return again.data;
}

type MessageRow = { conversation_id: string; sender: "visitor" | "admin"; body: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  let config: PushConfig;
  try {
    config = await loadConfig();
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }

  if (req.method === "GET") {
    return json({ publicKey: config.public_key });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!config.webhook_secret || req.headers.get("x-webhook-secret") !== config.webhook_secret) {
    return json({ error: "Unauthorized" }, 401);
  }

  const { record } = (await req.json()) as { record?: MessageRow };
  if (!record || record.sender !== "visitor") return json({ sent: 0 });

  webpush.setVapidDetails(VAPID_SUBJECT, config.public_key!, config.private_key!);

  const [{ data: conversation }, { data: subscriptions, error }] = await Promise.all([
    supabase.from("conversations").select("visitor_name").eq("id", record.conversation_id).single(),
    supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth"),
  ]);
  if (error) return json({ error: error.message }, 500);

  const payload = JSON.stringify({
    title: `💬 ${conversation?.visitor_name ?? "New visitor"}`,
    body: record.body.slice(0, 140),
    conversationId: record.conversation_id,
  });

  const expired: number[] = [];
  const results = await Promise.allSettled(
    (subscriptions ?? []).map((sub) =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 60 * 60 * 24 },
        )
        .catch((err: { statusCode?: number }) => {
          // the browser dropped this subscription; forget it
          if (err.statusCode === 404 || err.statusCode === 410) expired.push(sub.id);
          throw err;
        })
    ),
  );

  if (expired.length) {
    await supabase.from("push_subscriptions").delete().in("id", expired);
  }

  return json({
    sent: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
  });
});
