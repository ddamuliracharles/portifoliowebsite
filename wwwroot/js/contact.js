(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const config = window.portfolioContact || {};
  const toEmail = config.email || "ddamulira41@gmail.com";
  const formsubmitUrl =
    config.formsubmitUrl || `https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`;

  const statusEl = document.getElementById("contact-status");
  const submitBtn = form.querySelector('button[type="submit"]');
  const defaultBtnText = submitBtn?.textContent || "Send Message";

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = `contact-status contact-status--${type}`;
    statusEl.hidden = !message;
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "Sending…" : defaultBtnText;
    }
  }

  function validate() {
    const name = form.name?.value.trim();
    const email = form.email?.value.trim();
    const subject = form.subject?.value.trim();
    const message = form.message?.value.trim();

    if (!name) {
      setStatus("Please enter your name.", "error");
      form.name?.focus();
      return null;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please enter a valid email address.", "error");
      form.email?.focus();
      return null;
    }

    if (!subject) {
      setStatus("Please enter a subject.", "error");
      form.subject?.focus();
      return null;
    }

    if (!message || message.length < 10) {
      setStatus("Please enter a message (at least 10 characters).", "error");
      form.message?.focus();
      return null;
    }

    return { name, email, subject, message };
  }

  function openMailto(data) {
    const subject = encodeURIComponent(`[Portfolio] ${data.subject} — from ${data.name}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
    );
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    setStatus(
      "Your email app should open. If it did not, use the Email link on the left or copy ddamulira41@gmail.com.",
      "info"
    );
  }

  async function sendViaFormSubmit(data) {
    const payload = new FormData();
    payload.append("name", data.name);
    payload.append("email", data.email);
    payload.append("_replyto", data.email);
    payload.append("_subject", `[Portfolio] ${data.subject} — from ${data.name}`);
    payload.append("message", data.message);
    payload.append("_template", "table");
    payload.append("_captcha", "false");

    const response = await fetch(formsubmitUrl, {
      method: "POST",
      body: payload,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Send failed (${response.status})`);
    }

    const result = await response.json().catch(() => ({}));
    if (result.success === false) {
      throw new Error(result.message || "Send failed");
    }

    return result;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("", "");

    const data = validate();
    if (!data) return;

    setLoading(true);

    try {
      await sendViaFormSubmit(data);
      form.reset();
      setStatus(
        "Message sent successfully. I will get back to you at the email you provided.",
        "success"
      );
    } catch {
      openMailto(data);
    } finally {
      setLoading(false);
    }
  });

  const copyBtn = document.getElementById("copy-email-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(toEmail);
        setStatus("Email address copied to clipboard.", "success");
      } catch {
        setStatus(`Email: ${toEmail}`, "info");
      }
    });
  }
})();
