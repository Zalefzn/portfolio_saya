'use strict';

// Chat admin: inbox of every visitor conversation, live replies over
// Supabase Realtime, customer details, and Web Push subscription.
(function () {
  const cfg = window.CHAT_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);

  const views = document.querySelectorAll("[data-view]");
  const showView = (name) => views.forEach((v) => { v.hidden = v.dataset.view !== name; });

  // ------------------------------------------------------------- theme

  const root = document.documentElement;
  const themeIcon = $("[data-theme-icon]");
  const isDark = () =>
    root.dataset.theme === "dark" ||
    (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const syncThemeIcon = () => themeIcon.setAttribute("href", isDark() ? "#i-sun" : "#i-moon");

  $("[data-theme-toggle]").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("admin-theme", next); } catch (e) {}
    syncThemeIcon();
  });
  syncThemeIcon();

  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) {
    showView("unconfigured");
    return;
  }

  // read before the client consumes the tokens in the URL
  const arrivedFromResetLink = /type=recovery/.test(location.hash + location.search);

  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { storageKey: "chat-admin-auth:" + new URL(cfg.supabaseUrl).host, persistSession: true, autoRefreshToken: true }
  });

  const els = {
    app: $("[data-view=inbox]"),
    list: $("[data-conversation-list]"),
    count: $("[data-conversation-count]"),
    totalUnread: $("[data-total-unread]"),
    search: $("[data-search]"),
    filters: document.querySelectorAll("[data-filter]"),
    emptyInbox: $("[data-empty-inbox]"),
    emptyText: $("[data-empty-text]"),
    threadEmpty: $("[data-thread-empty]"),
    threadInner: $("[data-thread-inner]"),
    tAvatar: $("[data-thread-avatar]"),
    tName: $("[data-thread-name]"),
    tSubtitle: $("[data-thread-subtitle]"),
    tWa: $("[data-thread-wa]"),
    tMail: $("[data-thread-mail]"),
    messages: $("[data-messages]"),
    composer: $("[data-composer]"),
    reply: $("[data-reply]"),
    replyError: $("[data-reply-error]"),
    details: $("[data-details]"),
    dAvatar: $("[data-d-avatar]"),
    dName: $("[data-d-name]"),
    dTopic: $("[data-d-topic]"),
    dEmail: $("[data-d-email]"),
    dPhone: $("[data-d-phone]"),
    dCount: $("[data-d-count]"),
    dSince: $("[data-d-since]"),
    dWa: $("[data-d-wa]"),
    dMail: $("[data-d-mail]"),
    deleteBtn: $("[data-delete]"),
    deleteLabel: $("[data-delete-label]"),
    pushToggle: $("[data-push-toggle]"),
    pushHint: $("[data-push-hint]")
  };

  const TOPICS = {
    website: "Website / web app",
    mobile_app: "Mobile app",
    system: "Business system",
    other: "Other"
  };

  let me = null;
  let conversations = [];
  let activeId = null;
  let filter = "all";
  let rendered = new Set();
  let messageCount = 0;
  let lastDay = "";
  let lastSender = "";
  let channel = null;
  let deleteArmedUntil = 0;

  // ------------------------------------------------------------ helpers

  const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fmtDay = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const fmtListTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return fmtTime(iso);
    if ((now - d) / 86400000 < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { day: "numeric", month: "short" });
  };

  // stable, pleasant color per visitor
  const avatarStyle = (seed) => {
    // FNV-1a, so ids that differ by one character still land far apart
    let h = 2166136261;
    for (const ch of seed || "?") h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    const hue = h % 360;
    return `linear-gradient(135deg, hsl(${hue} 75% 60%), hsl(${(hue + 40) % 360} 70% 50%))`;
  };

  const initials = (name) =>
    (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join("") || "?";

  const paintAvatar = (el, c) => {
    el.textContent = initials(c.visitor_name);
    el.style.setProperty("--avatar-bg", avatarStyle(c.visitor_id || c.id));
  };

  // Indonesian numbers are usually written 08…; wa.me wants 628…
  const waLink = (phone) => {
    if (!phone) return "";
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "62" + digits.slice(1);
    return "https://wa.me/" + digits;
  };

  const setLink = (el, href, text) => {
    el.hidden = !href;
    if (href) el.href = href;
    if (text !== undefined) el.textContent = text || "—";
  };

  const topicChip = (topic) => {
    const chip = document.createElement("span");
    chip.className = "topic-chip";
    chip.dataset.topic = topic || "";
    chip.textContent = TOPICS[topic] || "No topic";
    return chip;
  };

  const updateUnreadBadges = () => {
    const total = conversations.reduce((sum, c) => sum + c.admin_unread, 0);
    document.title = (total ? "(" + total + ") " : "") + "Chat Admin";
    els.totalUnread.hidden = !total;
    els.totalUnread.textContent = total > 99 ? "99+" : total;
    if ("setAppBadge" in navigator) {
      (total ? navigator.setAppBadge(total) : navigator.clearAppBadge()).catch(() => {});
    }
  };

  // ------------------------------------------------------------- inbox

  const visibleConversations = () => {
    const q = els.search.value.trim().toLowerCase();
    return conversations
      .filter((c) => filter === "all" || c.admin_unread > 0)
      .filter((c) => !q || [c.visitor_name, c.visitor_email, c.visitor_phone, c.last_message_preview]
        .join(" ").toLowerCase().includes(q));
  };

  const renderList = () => {
    conversations.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
    const shown = visibleConversations();

    els.list.innerHTML = "";
    els.count.textContent = conversations.length;
    els.emptyInbox.hidden = shown.length > 0;
    els.emptyText.textContent = conversations.length
      ? (filter === "unread" ? "You're all caught up." : "No conversations match your search.")
      : "No conversations yet.";

    shown.forEach((c) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "conversation" + (c.id === activeId ? " is-active" : "") + (c.admin_unread ? " has-unread" : "");

      const avatar = document.createElement("span");
      avatar.className = "avatar";
      paintAvatar(avatar, c);

      const name = document.createElement("span");
      name.className = "conversation-name";
      name.textContent = c.visitor_name;

      const time = document.createElement("span");
      time.className = "conversation-time";
      time.textContent = fmtListTime(c.last_message_at);

      const preview = document.createElement("span");
      preview.className = "conversation-preview";
      preview.textContent = c.last_message_preview || "";

      btn.append(avatar, name, time, preview);

      if (c.admin_unread) {
        const dot = document.createElement("span");
        dot.className = "unread-dot";
        dot.textContent = c.admin_unread > 99 ? "99+" : c.admin_unread;
        btn.appendChild(dot);
      }

      const meta = document.createElement("span");
      meta.className = "conversation-meta";
      meta.appendChild(topicChip(c.topic));
      btn.appendChild(meta);

      btn.addEventListener("click", () => openConversation(c.id));
      li.appendChild(btn);
      els.list.appendChild(li);
    });

    updateUnreadBadges();
  };

  els.search.addEventListener("input", renderList);

  els.filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      els.filters.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn);
      });
      renderList();
    })
  );

  const loadConversations = async () => {
    const { data, error } = await client
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(300);
    if (!error) {
      conversations = data;
      renderList();
    }
  };

  // ----------------------------------------------------------- details

  const wideScreen = window.matchMedia("(min-width: 1181px)");

  const setDetailsOpen = (open) => {
    els.details.hidden = !open;
    els.app.classList.toggle("has-details", open && wideScreen.matches);
  };

  const renderDetails = (c) => {
    paintAvatar(els.dAvatar, c);
    els.dName.textContent = c.visitor_name;
    els.dTopic.dataset.topic = c.topic || "";
    els.dTopic.textContent = TOPICS[c.topic] || "No topic";
    setLink(els.dEmail, c.visitor_email ? "mailto:" + c.visitor_email : "", c.visitor_email);
    setLink(els.dPhone, c.visitor_phone ? "tel:" + c.visitor_phone.replace(/[^\d+]/g, "") : "", c.visitor_phone);
    els.dEmail.parentElement.parentElement.hidden = !c.visitor_email;
    els.dPhone.parentElement.parentElement.hidden = !c.visitor_phone;
    els.dCount.textContent = messageCount;
    els.dSince.textContent = new Date(c.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    setLink(els.dWa, waLink(c.visitor_phone));
    setLink(els.dMail, c.visitor_email ? "mailto:" + c.visitor_email : "");
    disarmDelete();
  };

  $("[data-details-toggle]").addEventListener("click", () => setDetailsOpen(els.details.hidden));
  $("[data-details-close]").addEventListener("click", () => setDetailsOpen(false));
  wideScreen.addEventListener("change", () => setDetailsOpen(!els.details.hidden && activeId !== null));

  // two-step delete instead of a blocking confirm()
  const disarmDelete = () => {
    deleteArmedUntil = 0;
    els.deleteBtn.classList.remove("is-armed");
    els.deleteLabel.textContent = "Delete conversation";
  };

  els.deleteBtn.addEventListener("click", async () => {
    if (!activeId) return;
    if (Date.now() > deleteArmedUntil) {
      deleteArmedUntil = Date.now() + 4000;
      els.deleteBtn.classList.add("is-armed");
      els.deleteLabel.textContent = "Click again to delete";
      setTimeout(() => { if (Date.now() > deleteArmedUntil) disarmDelete(); }, 4100);
      return;
    }
    const id = activeId;
    els.deleteBtn.disabled = true;
    const { error } = await client.from("conversations").delete().eq("id", id);
    els.deleteBtn.disabled = false;
    disarmDelete();
    if (error) {
      els.replyError.textContent = "Could not delete: " + error.message;
      return;
    }
    conversations = conversations.filter((c) => c.id !== id);
    closeConversation();
  });

  // ------------------------------------------------------------ thread

  const renderMessage = (msg) => {
    if (rendered.has(msg.id)) return;
    rendered.add(msg.id);
    messageCount++;
    els.dCount.textContent = messageCount;

    const day = new Date(msg.created_at).toDateString();
    if (day !== lastDay) {
      lastDay = day;
      lastSender = "";
      const divider = document.createElement("li");
      divider.className = "day-divider";
      divider.textContent = fmtDay(msg.created_at);
      els.messages.appendChild(divider);
    }

    const li = document.createElement("li");
    li.className = "msg " + (msg.sender === "admin" ? "is-mine" : "is-theirs") + (msg.sender === lastSender ? " is-grouped" : "");
    lastSender = msg.sender;

    const bubble = document.createElement("p");
    bubble.className = "bubble";
    bubble.textContent = msg.body;

    const time = document.createElement("time");
    time.dateTime = msg.created_at;
    time.textContent = fmtTime(msg.created_at);

    li.append(bubble, time);
    els.messages.appendChild(li);
    els.messages.scrollTop = els.messages.scrollHeight;
  };

  const markRead = (id) => {
    const c = conversations.find((x) => x.id === id);
    if (c && c.admin_unread) {
      c.admin_unread = 0;
      renderList();
    }
    client.rpc("mark_conversation_read", { conversation: id });
  };

  const openConversation = async (id, { pushHistory = true } = {}) => {
    const c = conversations.find((x) => x.id === id);
    if (!c) return;

    activeId = id;
    rendered = new Set();
    messageCount = 0;
    lastDay = "";
    lastSender = "";
    els.messages.innerHTML = "";
    els.threadEmpty.hidden = true;
    els.threadInner.hidden = false;
    els.app.classList.add("is-thread-open");
    els.replyError.textContent = "";

    paintAvatar(els.tAvatar, c);
    els.tName.textContent = c.visitor_name;
    els.tSubtitle.textContent = [TOPICS[c.topic], c.visitor_email].filter(Boolean).join(" · ") || "Visitor";
    setLink(els.tWa, waLink(c.visitor_phone));
    setLink(els.tMail, c.visitor_email ? "mailto:" + c.visitor_email : "");
    renderDetails(c);
    setDetailsOpen(wideScreen.matches);

    if (pushHistory) history.replaceState(null, "", "?c=" + encodeURIComponent(id));
    renderList();

    const { data } = await client
      .from("messages")
      .select("id, sender, body, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .limit(1000);

    if (activeId !== id) return;
    (data || []).forEach(renderMessage);
    markRead(id);
    if (wideScreen.matches) els.reply.focus();
  };

  const closeConversation = () => {
    activeId = null;
    els.app.classList.remove("is-thread-open");
    els.threadInner.hidden = true;
    els.threadEmpty.hidden = false;
    setDetailsOpen(false);
    history.replaceState(null, "", "./");
    renderList();
  };

  $("[data-back]").addEventListener("click", closeConversation);

  els.composer.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = els.reply.value.trim();
    if (!body || !activeId) return;

    const button = els.composer.querySelector("button");
    button.disabled = true;
    els.reply.value = "";
    els.replyError.textContent = "";

    const { data, error } = await client
      .from("messages")
      .insert({ conversation_id: activeId, sender: "admin", body })
      .select("id, sender, body, created_at")
      .single();

    button.disabled = false;
    if (error) {
      els.reply.value = body;
      els.replyError.textContent = "Could not send: " + error.message;
      return;
    }
    renderMessage(data);
    els.reply.focus();
  });

  els.reply.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      els.composer.requestSubmit();
    }
  });

  // ---------------------------------------------------------- realtime

  const subscribe = () => {
    if (channel) client.removeChannel(channel);

    channel = client
      .channel("admin-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, (payload) => {
        if (payload.eventType === "DELETE") {
          conversations = conversations.filter((c) => c.id !== payload.old.id);
          if (payload.old.id === activeId) closeConversation();
        } else {
          const row = payload.new;
          const i = conversations.findIndex((c) => c.id === row.id);
          // the open conversation is being read right now
          if (row.id === activeId && !document.hidden) row.admin_unread = 0;
          if (i === -1) conversations.push(row);
          else conversations[i] = row;
        }
        renderList();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new;
        if (msg.conversation_id !== activeId) return;
        renderMessage(msg);
        if (msg.sender === "visitor" && !document.hidden) markRead(activeId);
      })
      .subscribe((status) => {
        // catch up on anything missed while the socket was down
        if (status === "SUBSCRIBED") loadConversations();
      });
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && activeId) markRead(activeId);
  });

  // ------------------------------------------------------ push (PWA)

  const pushSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  let swRegistration = null;

  const urlBase64ToUint8Array = (base64) => {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, (ch) => ch.charCodeAt(0));
  };

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;

  const setPushUi = (on, hint) => {
    els.pushToggle.classList.toggle("is-on", on);
    els.pushToggle.title = on ? "Notifications on (click to turn off)" : "Enable notifications";
    els.pushToggle.setAttribute("aria-label", els.pushToggle.title);
    els.pushHint.hidden = !hint;
    els.pushHint.textContent = hint || "";
  };

  const refreshPushState = async () => {
    if (!pushSupported) {
      setPushUi(false, isIos && !isStandalone
        ? "To get notifications on iPhone/iPad: tap Share → Add to Home Screen, then open Chat Admin from the home screen."
        : "This browser does not support push notifications.");
      return;
    }
    const sub = swRegistration && await swRegistration.pushManager.getSubscription();
    if (Notification.permission === "denied") {
      setPushUi(false, "Notifications are blocked for this site. Allow them in the browser's site settings.");
    } else if (sub) {
      setPushUi(true, "");
    } else {
      setPushUi(false, "Tap the bell to get notified on this device when a visitor sends a message.");
    }
  };

  const saveSubscription = async (sub) => {
    const json = sub.toJSON();
    const { error } = await client.from("push_subscriptions").upsert(
      {
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent.slice(0, 250)
      },
      { onConflict: "endpoint" }
    );
    if (error) throw error;
  };

  els.pushToggle.addEventListener("click", async () => {
    if (!pushSupported || !swRegistration) return refreshPushState();

    try {
      const existing = await swRegistration.pushManager.getSubscription();
      if (existing) {
        await client.from("push_subscriptions").delete().eq("endpoint", existing.endpoint);
        await existing.unsubscribe();
      } else {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // the notify-admin function owns the VAPID key pair
          const res = await fetch(cfg.supabaseUrl + "/functions/v1/notify-admin");
          const { publicKey } = await res.json();
          if (!publicKey) throw new Error("push is not set up on the server yet");
          const sub = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
          });
          await saveSubscription(sub);
        }
      }
    } catch (err) {
      setPushUi(false, "Could not change notifications: " + err.message);
      return;
    }
    refreshPushState();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).then(async (reg) => {
      swRegistration = reg;
      await navigator.serviceWorker.ready;
      // keep the stored subscription fresh in case the browser rotated it
      const sub = await reg.pushManager.getSubscription();
      if (sub && me) saveSubscription(sub).catch(() => {});
      refreshPushState();
    }).catch(() => refreshPushState());

    // notification clicked while the app is already open
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "open-conversation") {
        const id = new URL(event.data.url).searchParams.get("c");
        if (id) openConversation(id);
      }
    });
  } else {
    refreshPushState();
  }

  // -------------------------------------------------------------- auth

  const enterInbox = async (session) => {
    me = session.user;
    const { data: isAdmin } = await client.rpc("is_chat_admin");

    if (!isAdmin) {
      $("[data-user-id]").textContent = me.id;
      showView("forbidden");
      return;
    }

    showView("inbox");
    await loadConversations();
    subscribe();
    refreshPushState();

    const wanted = new URLSearchParams(location.search).get("c");
    if (wanted) openConversation(wanted, { pushHistory: false });
  };

  $("[data-login-form]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const button = e.target.querySelector("button");
    const errorEl = $("[data-login-error]");

    button.disabled = true;
    errorEl.textContent = "";

    const { data, error } = await client.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password"))
    });

    button.disabled = false;
    if (error) {
      errorEl.textContent = error.message;
      return;
    }
    e.target.reset();
    enterInbox(data.session);
  });

  // ---------------------------------------------------------- password

  // reset links come back to this page, so the redirect target must be in
  // Supabase Auth → URL Configuration → Redirect URLs
  const adminUrl = location.origin + location.pathname;
  let passwordReturnView = "login";

  const openPasswordView = (returnTo) => {
    passwordReturnView = returnTo;
    $("[data-password-error]").textContent = "";
    $("[data-password-form]").reset();
    showView("password");
  };

  $("[data-forgot]").addEventListener("click", async () => {
    const form = $("[data-login-form]");
    const email = form.email.value.trim();
    const errorEl = $("[data-login-error]");
    const infoEl = $("[data-login-info]");
    errorEl.textContent = "";
    infoEl.textContent = "";

    if (!email || !form.email.checkValidity()) {
      errorEl.textContent = "Type your email above first, then click “Forgot password?”.";
      form.email.focus();
      return;
    }
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: adminUrl });
    if (error) errorEl.textContent = error.message;
    else infoEl.textContent = "If that email has an account, a reset link is on its way. Open it on this device.";
  });

  $("[data-change-password]").addEventListener("click", () => openPasswordView("inbox"));

  $("[data-password-cancel]").addEventListener("click", () => {
    history.replaceState(null, "", location.pathname);
    if (passwordReturnView === "inbox" && me) showView("inbox");
    else showView("login");
  });

  $("[data-password-form]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorEl = $("[data-password-error]");
    const password = form.password.value;
    errorEl.textContent = "";

    if (password !== form.confirm.value) {
      errorEl.textContent = "The two passwords don't match.";
      return;
    }

    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    const { error } = await client.auth.updateUser({ password });
    button.disabled = false;

    if (error) {
      errorEl.textContent = error.message;
      return;
    }
    form.reset();
    history.replaceState(null, "", location.pathname);
    const { data: { session } } = await client.auth.getSession();
    if (session) enterInbox(session);
    else showView("login");
  });

  // arriving from the emailed reset link
  client.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") openPasswordView("login");
  });

  document.querySelectorAll("[data-sign-out]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (channel) client.removeChannel(channel);
      channel = null;
      await client.auth.signOut();
      me = null;
      conversations = [];
      closeConversation();
      showView("login");
    })
  );

  client.auth.getSession().then(({ data: { session } }) => {
    if (arrivedFromResetLink) openPasswordView("login");
    else if (session && !session.user.is_anonymous) enterInbox(session);
    else showView("login");
  });
})();
