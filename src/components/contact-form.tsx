"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import type { Service } from "@/lib/site-content-schema";

type ContactFormProps = { services: Service[] };
type FormState = { kind: "idle" | "loading" | "success" | "error"; message: string };
const initialState: FormState = { kind: "idle", message: "" };

export function ContactForm({ services }: ContactFormProps) {
  const [state, setState] = useState<FormState>(initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "loading") return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setState({ kind: "loading", message: "Sending your note…" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.get("name"),
          email: fields.get("email"),
          company: fields.get("company"),
          service: fields.get("service"),
          message: fields.get("message"),
          website: fields.get("website"),
        }),
      });
      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Your note could not be sent.");
      form.reset();
      setState({ kind: "success", message: payload.message || "Your note is with us. We’ll be in touch soon." });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Something went wrong. Please try again." });
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__row">
        <label className="field"><span>Your name</span><input autoComplete="name" name="name" required maxLength={90} placeholder="A name to go with the idea" /></label>
        <label className="field"><span>Email address</span><input autoComplete="email" type="email" name="email" required maxLength={160} placeholder="you@somewhere.com" /></label>
      </div>
      <div className="contact-form__row">
        <label className="field"><span>Company <em>optional</em></span><input autoComplete="organization" name="company" maxLength={120} placeholder="The people behind it" /></label>
        <label className="field"><span>What are you making?</span>
          <select name="service" required defaultValue="">
            <option value="" disabled>Choose a direction</option>
            {services.map((service) => <option value={service.title} key={service.id}>{service.title}</option>)}
            <option value="Something else">Something else</option>
          </select>
        </label>
      </div>
      <label className="field"><span>Tell us a little about it</span><textarea name="message" required minLength={10} maxLength={2000} rows={5} placeholder="The ambition, the audience, the feeling you want to leave behind…" /></label>
      <label className="honeypot" aria-hidden="true" tabIndex={-1}>Leave this field empty<input name="website" autoComplete="off" tabIndex={-1} /></label>
      <div className="contact-form__submit">
        <p className="form-note">Your details stay in the studio inbox and are used only to reply to this project note.</p>
        <button className="button button--primary" type="submit" disabled={state.kind === "loading"} data-sonic="true">
          {state.kind === "loading" ? <LoaderCircle className="spinner" size={17} aria-hidden="true" /> : <>{state.kind === "success" ? "Note received" : "Send the first frame"} <ArrowUpRight size={17} aria-hidden="true" /></>}
        </button>
      </div>
      <p className={`form-status form-status--${state.kind}`} role="status" aria-live="polite">{state.message}</p>
    </form>
  );
}
