import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webPush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  recipientId: string;
  title: string;
  body: string;
  type: "plan" | "proposal" | "status" | "memory" | "system" | "invite";
  url?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || Deno.env.get("VITE_WEB_PUSH_PUBLIC_KEY") || "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") || "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:support@tezacouple.app";

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("[send-push-notification] VAPID keys missing. Push notification skipped.");
      return new Response(
        JSON.stringify({ success: false, error: "VAPID keys not configured on server" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const payload: PushPayload = await req.json();
    const { recipientId, title, body, type, url, icon, badge, data } = payload;

    if (!recipientId || !title) {
      return new Response(
        JSON.stringify({ success: false, error: "recipientId and title are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check user notification preferences
    const { data: prefs, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", recipientId)
      .single();

    if (prefsError && prefsError.code !== "PGRST116") {
      console.error("[send-push-notification] Error fetching preferences:", prefsError);
    }

    if (prefs) {
      if (prefs.push_notifications === false) {
        return new Response(
          JSON.stringify({ success: true, message: "Push notifications disabled by recipient" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Check category specific preference
      const categoryAllowed =
        (type === "proposal" && prefs.proposal_alerts !== false) ||
        (type === "status" && prefs.status_updates !== false) ||
        (type === "plan" && prefs.plan_reminders !== false) ||
        (type === "memory" && prefs.memory_comments !== false) ||
        type === "invite" ||
        type === "system";

      if (!categoryAllowed) {
        return new Response(
          JSON.stringify({ success: true, message: `Push category ${type} disabled by recipient` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // 2. Fetch push subscriptions for recipient
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", recipientId);

    if (subError || !subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No active push subscriptions for recipient" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const notificationData = JSON.stringify({
      title,
      body,
      type,
      url: url || "/",
      icon: icon || "/pwa-192x192.png",
      badge: badge || "/favicon-32x32.png",
      timestamp: Date.now(),
      data: data || {},
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webPush.sendNotification(pushSubscription, notificationData);
          return { endpoint: sub.endpoint, status: "sent" };
        } catch (err: any) {
          // If subscription has expired or is invalid (410 Gone or 404 Not Found), remove from DB
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`[send-push-notification] Removing expired subscription endpoint: ${sub.endpoint}`);
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
          throw err;
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed,
        total: subscriptions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("[send-push-notification] Handler error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
