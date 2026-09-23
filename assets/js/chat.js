'use strict';

// Visitor side of the live chat on the Contact page.
// Each visitor signs in anonymously, owns exactly one conversation and gets
// the owner's replies in real time over Supabase Realtime (WebSocket).
(function () {
  const root = document.querySelector("[data-chat]");
  if (!root) return;

  const cfg = window.CHAT_CONFIG || {};
  const els = {
    unavailable: root.querySelector("[data-chat-unavailable]"),
    start: root.querySelector("[data-chat-start]"),
    box: root.querySelector("[data-chat-box]"),
    list: root.querySelector("[data-chat-messages]"),
    compose: root.querySelector("[data-chat-compose]"),
    input: root.querySelector("[data-chat-input]"),
    status: root.querySelector("[data-chat-status]")
  };

  const strings = {
    en: {
      you: "You",
      owner: "Rizal",
      sending: "Sending…",
      failed: "Message could not be sent. Please try again.",
      startFailed: "Could not start the chat. Please try again or use WhatsApp / email.",
      rateLimited: "You're sending messages too fast. Please wait a moment.",
      newReply: "New reply",
      welcome: "Hi! Thanks for reaching out. Leave your message here and I'll reply as soon as I can — you can close this page and come back later."
    },
    id: {
      you: "Anda",
      owner: "Rizal",
      sending: "Mengirim…",
      failed: "Pesan gagal dikirim. Silakan coba lagi.",
      startFailed: "Chat gagal dimulai. Silakan coba lagi atau hubungi lewat WhatsApp / email.",
      rateLimited: "Pesan terlalu cepat. Mohon tunggu sebentar.",
      newReply: "Balasan baru",
      welcome: "Halo! Terima kasih sudah menghubungi. Tulis pesan di sini dan saya akan membalas secepatnya — halaman ini boleh ditutup dan dibuka lagi nanti."
    }
  };
  const lang = function () { return document.documentElement.lang === "id" ? "id" : "en"; };
  const t = function (key) { return strings[lang()][key]; };

  const setStatus = function (message, isError) {
    els.status.textContent = message || "";
    els.status.classList.toggle("is-error", !!isError);
  };

  const show = function (view) {
    els.unavailable.hidden = view !== "unavailable";
    els.start.hidden = view !== "start";
    els.box.hidden = view !== "chat";
  };

  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) {
    show("unavailable");
    return;
  }

  // separate storage key so an admin session in /admin/ never leaks in here
  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { storageKey: "chat-visitor-auth:" + new URL(cfg.supabaseUrl).host, persistSession: true, autoRefreshToken: true }
  });

  let conversation = null;
  let channel = null;
  let unseen = 0;
  const baseTitle = document.title;
  const rendered = new Set();

  const formatTime = function (iso) {
    const d = new Date(iso);
    const sameDay = d.toDateString() === new Date().toDateString();
    const locale = lang() === "id" ? "id-ID" : "en-GB";
    return sameDay
      ? d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = function (msg) {
    if (rendered.has(msg.id)) return;
    rendered.add(msg.id);

    const li = document.createElement("li");
    li.className = "chat-msg " + (msg.sender === "visitor" ? "is-mine" : "is-theirs");

    const bubble = document.createElement("p");
    bubble.className = "chat-bubble";
    bubble.textContent = msg.body;

    const meta = document.createElement("time");
    meta.className = "chat-meta";
    meta.dateTime = msg.created_at;
    meta.textContent = (msg.sender === "visitor" ? t("you") : t("owner")) + " · " + formatTime(msg.created_at);

    li.appendChild(bubble);
    li.appendChild(meta);
    els.list.appendChild(li);
    els.list.scrollTop = els.list.scrollHeight;
  };

  const renderWelcome = function () {
    const li = document.createElement("li");
    li.className = "chat-msg is-theirs is-system";
    const bubble = document.createElement("p");
    bubble.className = "chat-bubble";
    bubble.dataset.chatWelcome = "";
    bubble.textContent = t("welcome");
    li.appendChild(bubble);
    els.list.appendChild(li);
  };

  const markRead = function () {
    if (!conversation || document.hidden) return;
    client.rpc("mark_conversation_read", { conversation: conversation.id });
  };

  const notifyReply = function (msg) {
    if (!document.hidden) return;
    unseen++;
    document.title = "(" + unseen + ") " + t("newReply") + " · " + baseTitle;
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const n = new Notification(t("newReply") + " — Rizal Fauzan", {
          body: msg.body.slice(0, 140),
          icon: "./assets/images/avatar.webp",
          tag: "chat-reply"
        });
        n.onclick = function () { window.focus(); n.close(); };
      } catch (e) {}
    }
  };

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      unseen = 0;
      document.title = baseTitle;
      markRead();
    }
  });

  const subscribe = function () {
    if (channel) return;
    channel = client
      .channel("chat-" + conversation.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: "conversation_id=eq." + conversation.id },
        function (payload) {
          const msg = payload.new;
          const isNew = !rendered.has(msg.id);
          renderMessage(msg);
          if (isNew && msg.sender === "admin") {
            notifyReply(msg);
            markRead();
          }
        }
      )
      .subscribe();
  };

  const openThread = async function () {
    show("chat");
    els.list.innerHTML = "";
    rendered.clear();
    renderWelcome();

    const { data, error } = await client
      .from("messages")
      .select("id, sender, body, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(500);

    if (!error) data.forEach(renderMessage);
    subscribe();
    markRead();
  };

  const errorMessage = function (error, fallbackKey) {
    return error && /too many messages/i.test(error.message) ? t("rateLimited") : t(fallbackKey);
  };

  const askNotificationPermission = function () {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(function () {});
    }
  };

  const sendMessage = async function (body) {
    const { data, error } = await client
      .from("messages")
      .insert({ conversation_id: conversation.id, sender: "visitor", body: body })
      .select("id, sender, body, created_at")
      .single();
    if (error) throw error;
    renderMessage(data);
  };

  // first message: create the anonymous identity + conversation
  els.start.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!els.start.checkValidity()) {
      els.start.reportValidity();
      return;
    }

    const form = new FormData(els.start);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim();
    const phone = String(form.get("phone")).trim();
    const topic = String(form.get("topic"));
    const body = String(form.get("message")).trim();
    const button = els.start.querySelector("button[type=submit]");

    button.disabled = true;
    setStatus(t("sending"));
    askNotificationPermission();

    try {
      const freshIdentity = async function () {
        await client.auth.signOut().catch(function () {});
        const { error } = await client.auth.signInAnonymously({ options: { data: { name: name } } });
        if (error) throw error;
      };

      const createConversation = function () {
        return client
          .from("conversations")
          .insert({ visitor_name: name, visitor_email: email, visitor_phone: phone, topic: topic })
          .select()
          .single();
      };

      const { data: { session } } = await client.auth.getSession();
      if (!session) await freshIdentity();

      let { data, error } = await createConversation();
      // a stored session can outlive its anonymous user (e.g. after a cleanup):
      // start over with a new identity once
      if (error && session && !/too many messages/i.test(error.message)) {
        await freshIdentity();
        ({ data, error } = await createConversation());
      }
      if (error) throw error;

      conversation = data;
      await openThread();
      await sendMessage(body);
      els.start.reset();
      setStatus("");
    } catch (err) {
      setStatus(errorMessage(err, "startFailed"), true);
    } finally {
      button.disabled = false;
    }
  });

  // follow-up messages
  els.compose.addEventListener("submit", async function (e) {
    e.preventDefault();
    const body = els.input.value.trim();
    if (!body) return;

    const button = els.compose.querySelector("button[type=submit]");
    button.disabled = true;
    els.input.value = "";

    try {
      await sendMessage(body);
      setStatus("");
    } catch (err) {
      els.input.value = body;
      setStatus(errorMessage(err, "failed"), true);
    } finally {
      button.disabled = false;
      els.input.focus();
    }
  });

  // Enter sends, Shift+Enter makes a new line
  els.input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      els.compose.requestSubmit();
    }
  });

  // re-render the fixed strings when the site language changes
  new MutationObserver(function () {
    const welcome = root.querySelector("[data-chat-welcome]");
    if (welcome) welcome.textContent = t("welcome");
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  // returning visitor? pick up the existing conversation
  (async function init() {
    const { data: { session } } = await client.auth.getSession();
    if (session) {
      const { data } = await client.from("conversations").select().maybeSingle();
      if (data) {
        conversation = data;
        await openThread();
        return;
      }
    }
    show("start");
  })().catch(function () { show("start"); });
})();
