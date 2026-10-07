"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, LockKeyhole, LoaderCircle } from "lucide-react";

type LoginResponse = { url?: string; error?: string };

const callbackMessages: Record<string, string> = {
  "access-denied": "The Manus sign-in could not be completed. Please try again.",
  cancelled: "Sign-in was cancelled.",
  failed: "The Manus sign-in could not be verified. Please try again.",
  "not-allowed": "This Manus account is not on the studio administrator allowlist.",
};

export function AdminLogin() {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("auth");
    if (!status) return;
    const message = callbackMessages[status];
    if (message) {
      setNotice(message);
      setFailed(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function startSignIn() {
    if (pending) return;
    setPending(true);
    setNotice("");
    setFailed(false);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = await response.json() as LoginResponse;
      if (!response.ok || !payload.url) throw new Error(payload.error || "Unable to start Manus sign-in.");
      window.location.assign(payload.url);
    } catch (error) {
      setFailed(true);
      setNotice(error instanceof Error ? error.message : "Unable to start Manus sign-in.");
      setPending(false);
    }
  }

  return (
    <main className="container admin-page">
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-login-card__top"><LockKeyhole size={16} aria-hidden="true" /><span>PRIVATE STUDIO ACCESS</span></div>
          <h1>Your studio,<br />behind the scenes.</h1>
          <p>Sign in with your approved Manus account to update the public site and review project inquiries.</p>
          <button className="button button--primary admin-oauth-button" type="button" onClick={() => void startSignIn()} disabled={pending} data-sonic="true">
            {pending ? <><LoaderCircle className="spinner" size={17} aria-hidden="true" />Connecting…</> : <>Continue with Manus <ArrowUpRight size={16} aria-hidden="true" /></>}
          </button>
          <p className={`admin-notice${failed ? " admin-notice--error" : notice ? " admin-notice--success" : ""}`} role="status" aria-live="polite">{notice}</p>
          <p className="admin-login-hint">Only accounts on the site owner&apos;s private administrator allowlist can enter. There is no public sign-up.</p>
        </div>
      </div>
    </main>
  );
}
