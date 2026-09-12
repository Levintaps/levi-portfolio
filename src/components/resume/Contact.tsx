import { useEffect, useRef, useState } from 'react';
import { profile } from '../../data/resume';
import {
  looksAutomated,
  sendContact,
  validateContact,
  type ContactPayload,
} from '../../lib/contact';
import SectionHeading from '../common/SectionHeading';
import IconLink from '../common/IconLink';
import { Icon } from '../common/icons';
import styles from './Contact.module.css';

const empty: ContactPayload = { name: '', email: '', subject: '', message: '' };
const COPIED_MS = 2400;

export default function Contact() {
  const [payload, setPayload] = useState<ContactPayload>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactPayload, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');

  // Two signals a person cannot produce: a field they never see, and a form
  // filled in faster than anyone can read it. The hidden field is named for
  // nothing a browser knows how to autofill, so no visitor's own browser can
  // put a value in it on their behalf.
  const [honeypot, setHoneypot] = useState('');
  const openedAt = useRef(Date.now());
  const copyTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  function update(field: keyof ContactPayload, value: string) {
    setPayload((current) => ({ ...current, [field]: value }));
    setStatus('idle');
    setErrors({});
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopy('copied');
    } catch {
      setCopy('failed');
    }

    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopy('idle'), COPIED_MS);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('idle');
    const found = validateContact(payload);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // A trapped submission is answered exactly like a real one. Telling a
    // script it failed only teaches it to come back differently.
    if (looksAutomated({ honeypot, elapsedMs: Date.now() - openedAt.current })) {
      setStatus('sent');
      setPayload(empty);
      return;
    }

    setStatus('sending');
    try {
      await sendContact(payload);
      setStatus('sent');
      setPayload(empty);
    } catch {
      setStatus('failed');
    }
  }

  return (
    <section className={styles.section} id="contact">
      <SectionHeading
        index="07 / Contact"
        title="Get in touch"
        lead="Open to software developer roles and client work."
      />

      <div className={styles.layout}>
        <div className={styles.reach}>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.emailRow}>
              <a className={styles.detailValue} href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              <button type="button" className={styles.copy} onClick={copyEmail}>
                {copy === 'copied' ? 'Copied' : 'Copy'}
              </button>
            </span>
            {copy === 'failed' ? (
              <span className={styles.copyNote} role="status">
                Could not copy. The address is beside the button.
              </span>
            ) : null}
          </div>

          <div className={styles.detail}>
            <span className={styles.detailLabel}>Phone</span>
            <a className={styles.detailValue} href={`tel:${profile.phone.replace(/\s/g, '')}`}>
              {profile.phone}
            </a>
          </div>

          <div className={styles.detail}>
            <span className={styles.detailLabel}>Location</span>
            <span className={styles.detailValue}>{profile.location}</span>
            <span className={styles.detailAside}>{profile.timezone}</span>
          </div>

          <div className={styles.socials}>
            {profile.socials.map((social) => (
              <IconLink
                key={social.label}
                href={social.href}
                label={social.label}
                icon={social.icon}
              />
            ))}
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.pair}>
            <div className={styles.field}>
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                value={payload.name}
                onChange={(event) => update('name', event.target.value)}
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
              />
              {errors.name ? (
                <span id="contact-name-error" className={styles.fieldError}>
                  {errors.name}
                </span>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                value={payload.email}
                onChange={(event) => update('email', event.target.value)}
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
              />
              {errors.email ? (
                <span id="contact-email-error" className={styles.fieldError}>
                  {errors.email}
                </span>
              ) : null}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject"
              value={payload.subject}
              onChange={(event) => update('subject', event.target.value)}
              aria-invalid={errors.subject ? true : undefined}
              aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
            />
            {errors.subject ? (
              <span id="contact-subject-error" className={styles.fieldError}>
                {errors.subject}
              </span>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              rows={5}
              value={payload.message}
              onChange={(event) => update('message', event.target.value)}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
            />
            {errors.message ? (
              <span id="contact-message-error" className={styles.fieldError}>
                {errors.message}
              </span>
            ) : null}
          </div>

          <input
            className={styles.honeypot}
            type="text"
            name="referral-code"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {status === 'failed' ? (
            <p className={styles.error} role="alert">
              That did not send. Please email {profile.email} directly.
            </p>
          ) : null}

          {status === 'sent' ? (
            <p className={styles.sent} role="status">
              Message sent. Thank you.
            </p>
          ) : null}

          <button className={styles.submit} type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending' : 'Send message'}
            <Icon name="arrow" size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
