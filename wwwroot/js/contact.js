(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const RECIPIENT = "ddamulira44@gmail.com";
  const config = window.portfolioContact || {};
  const toEmail = (config.recipientEmail || config.email || RECIPIENT).toLowerCase();
  const formsubmitUrl =
    config.formsubmitUrl || `https://formsubmit.co/ajax/${toEmail}`;

  const feedbackEl = document.getElementById("contact-feedback");
  const feedbackTitle = document.getElementById("contact-feedback-title");
  const feedbackDetail = document.getElementById("contact-feedback-detail");
  const feedbackIcon = document.getElementById("contact-feedback-icon");
  const submitBtn = form.querySelector('button[type="submit"]');
  const defaultBtnText = submitBtn?.textContent || "Send Message";

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    loading: "…",
    warning: "!",
  };

  function showFeedback(title, detail, type) {
    if (!feedbackEl) return;

    feedbackEl.hidden = false;
    feedbackEl.className = `contact-feedback contact-feedback--${type}`;
    if (feedbackTitle) feedbackTitle.textContent = title;
    if (feedbackDetail) feedbackDetail.textContent = detail || "";
    if (feedbackIcon) feedbackIcon.textContent = icons[type] || "";

    feedbackEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideFeedback() {
    if (feedbackEl) feedbackEl.hidden = true;
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "Sending…" : defaultBtnText;
    }
    if (loading) {
      showFeedback(
        "Sending your message…",
        "Please wait while we deliver your message.",
        "loading"
      );
    }
  }

  function validate() {
    const name = form.name?.value.trim();
    const email = form.email?.value.trim();
    const subject = form.subject?.value.trim();
    const message = form.message?.value.trim();

    if (!name) {
      showFeedback("Message not sent", "Please enter your name.", "error");
      form.name?.focus();
      return null;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback("Message not sent", "Please enter a valid email address.", "error");
      form.email?.focus();
      return null;
    }

    if (!subject) {
      showFeedback("Message not sent", "Please enter a subject.", "error");
      form.subject?.focus();
      return null;
    }

    if (!message || message.length < 10) {
      showFeedback(
        "Message not sent",
        "Please enter a message with at least 10 characters.",
        "error"
      );
      form.message?.focus();
      return null;
    }

    return { name, email, subject, message };
  }

  async function sendViaFormSubmit(data) {
    const payload = new FormData();
    payload.append("_to", toEmail);
    payload.append("_replyto", data.email);
    payload.append("_subject", `[Portfolio] ${data.subject} — from ${data.name}`);
    payload.append("name", data.name);
    payload.append("email", data.email);
    payload.append("subject", data.subject);
    payload.append("message", data.message);
    payload.append("_template", "table");
    payload.append("_captcha", "false");

    const response = await fetch(formsubmitUrl, {
      method: "POST",
      body: payload,
      headers: { Accept: "application/json" },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      const detail =
        result.message ||
        (response.status === 522
          ? "The mail service is temporarily unavailable. Try again in a few minutes."
          : `Server returned error ${response.status}.`);
      throw new Error(detail);
    }

    return result;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFeedback();

    const data = validate();
    if (!data) return;

    setLoading(true);

    try {
      await sendViaFormSubmit(data);
      form.reset();
      showFeedback(
        "Message sent successfully",
        `Your message was delivered to ${toEmail}. I will reply to ${data.email} as soon as possible.`,
        "success"
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error.";
      showFeedback(
        "Message was not sent",
        `${detail} Try again, or email ${toEmail} directly.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  });

  const copyBtn = document.getElementById("copy-email-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(toEmail);
        showFeedback("Copied", `${toEmail} copied to clipboard.`, "success");
      } catch {
        showFeedback("Email address", toEmail, "info");
      }
    });
  }
})();
