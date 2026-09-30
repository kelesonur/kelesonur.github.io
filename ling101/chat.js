(function () {
  "use strict";

  /* Public Cloudflare Worker URL. Empty until deploy — popup still opens. */
  const CHAT_ENDPOINT = "https://ling313-chat.kelesonur.workers.dev";
  const USAGE_KEY = "ling101-chat-usage-v1";
  const DAILY_LIMIT = 10;

  const LIMIT_MSG =
    "You've reached today's LING 101 chatbot limit. For additional questions, please contact the TA at onur.keles1@bogazici.edu.tr.";
  const NOT_CONNECTED_MSG = "The course assistant is not connected yet.";
  const API_ERROR_MSG = "Something went wrong. Please try again later or email the TA.";

  const conversation = [];
  let busy = false;

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function readUsage() {
    try {
      const raw = localStorage.getItem(USAGE_KEY);
      if (!raw) return { date: todayKey(), count: 0 };
      const data = JSON.parse(raw);
      if (!data || data.date !== todayKey()) return { date: todayKey(), count: 0 };
      return { date: data.date, count: Number(data.count) || 0 };
    } catch (e) {
      return { date: todayKey(), count: 0 };
    }
  }

  function writeUsage(count) {
    try {
      localStorage.setItem(
        USAGE_KEY,
        JSON.stringify({ date: todayKey(), count: count })
      );
    } catch (e) {
      /* ignore quota errors */
    }
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] !== undefined && attrs[k] !== null) {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(c);
    });
    return node;
  }

  function appendBubble(transcript, role, text) {
    const bubble = el("div", {
      className: "ling101-chat-msg ling101-chat-msg--" + role,
      text: text,
    });
    transcript.appendChild(bubble);
    transcript.scrollTop = transcript.scrollHeight;
    return bubble;
  }

  function setOpen(root, open) {
    root.classList.toggle("is-open", open);
    const panel = root.querySelector(".ling101-chat-panel");
    const toggle = root.querySelector(".ling101-chat-toggle");
    if (panel) panel.hidden = !open;
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      const input = root.querySelector(".ling101-chat-input");
      if (input) setTimeout(function () { input.focus(); }, 50);
    }
  }

  async function callChatEndpoint(message, history) {
    if (!CHAT_ENDPOINT) {
      const err = new Error("not_connected");
      err.code = "not_connected";
      throw err;
    }
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course: "ling101",
        message: message,
        history: history,
      }),
    });
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    if (res.status === 503 || (data && data.error === "not_connected")) {
      const err = new Error("not_connected");
      err.code = "not_connected";
      throw err;
    }
    const content = data && data.reply;
    if (typeof content === "string" && content.trim()) {
      // Worker may return the daily-limit line with HTTP 200.
      if (!res.ok && !(data && data.limited)) {
        // Prefer explicit reply text when present, else generic failure below.
      }
      if (res.ok || (data && data.limited) || res.status === 429) {
        return content.trim();
      }
    }
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    throw new Error("Empty response");
  }

  function buildUI() {
    const root = el("div", {
      className: "ling101-chat",
      id: "ling101Chat",
    });

    const toggle = el(
      "button",
      {
        type: "button",
        className: "ling101-chat-toggle",
        "aria-expanded": "false",
        "aria-controls": "ling101ChatPanel",
        text: "Course questions",
      }
    );

    const panel = el("div", {
      className: "ling101-chat-panel",
      id: "ling101ChatPanel",
      role: "dialog",
      "aria-labelledby": "ling101ChatTitle",
      hidden: "hidden",
    });

    const header = el("div", { className: "ling101-chat-header" }, [
      el("div", { className: "ling101-chat-header-text" }, [
        el("h2", { id: "ling101ChatTitle", text: "LING 101 course assistant" }),
      ]),
      el("button", {
        type: "button",
        className: "ling101-chat-close",
        "aria-label": "Close chat",
        text: "×",
      }),
    ]);

    const transcript = el("div", {
      className: "ling101-chat-transcript",
      role: "log",
      "aria-live": "polite",
    });

    const form = el("form", { className: "ling101-chat-form" });
    const input = el("input", {
      type: "text",
      className: "ling101-chat-input",
      placeholder: "Ask a logistics question…",
      autocomplete: "off",
      maxlength: "500",
      "aria-label": "Your question",
    });
    const send = el("button", {
      type: "submit",
      className: "ling101-chat-send primary",
      text: "Send",
    });
    form.appendChild(input);
    form.appendChild(send);

    panel.appendChild(header);
    panel.appendChild(transcript);
    panel.appendChild(form);
    root.appendChild(toggle);
    root.appendChild(panel);
    document.body.appendChild(root);

    toggle.addEventListener("click", function () {
      setOpen(root, !root.classList.contains("is-open"));
    });
    panel.querySelector(".ling101-chat-close").addEventListener("click", function () {
      setOpen(root, false);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSend(transcript, input, send);
    });

    return root;
  }

  async function handleSend(transcript, input, sendBtn) {
    if (busy) return;
    const text = (input.value || "").trim();
    if (!text) return;

    const usage = readUsage();
    if (usage.count >= DAILY_LIMIT) {
      appendBubble(transcript, "assistant", LIMIT_MSG);
      input.value = "";
      return;
    }

    appendBubble(transcript, "user", text);
    input.value = "";

    if (!CHAT_ENDPOINT) {
      appendBubble(transcript, "assistant", NOT_CONNECTED_MSG);
      return;
    }

    const history = conversation.slice();
    conversation.push({ role: "user", content: text });
    busy = true;
    sendBtn.disabled = true;
    input.disabled = true;
    const pending = appendBubble(transcript, "assistant", "…");

    try {
      writeUsage(usage.count + 1);
      const reply = await callChatEndpoint(text, history);
      pending.textContent = reply;
      conversation.push({ role: "assistant", content: reply });
    } catch (err) {
      if (err && err.code === "not_connected") {
        pending.textContent = NOT_CONNECTED_MSG;
      } else {
        pending.textContent = API_ERROR_MSG;
      }
      conversation.pop();
      writeUsage(Math.max(0, readUsage().count - 1));
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
      transcript.scrollTop = transcript.scrollHeight;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUI);
  } else {
    buildUI();
  }
})();
