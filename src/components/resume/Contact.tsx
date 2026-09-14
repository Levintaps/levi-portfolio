import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { profile } from '../../data/resume';
import {
  looksAutomated,
  sendContact,
  validateContact,
  type ContactErrors,
  type ContactPayload,
} from '../../lib/contact';
import SectionHeading from '../common/SectionHeading';
import IconLink from '../common/IconLink';
import StatusBanner from '../common/StatusBanner';
import { Icon } from '../common/icons';
import styles from './Contact.module.css';

type Field = keyof ContactPayload;

const empty: ContactPayload = { name: '', email: '', subject: '', message: '' };
const FIELDS: Field[] = ['name', 'email', 'subject', 'message'];
const COPIED_MS = 2000;

export default function Contact() {
  const [payload, setPayload] = useState<ContactPayload>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  // Fields the visitor has typed in. Only these are checked on the way out,
  // so tabbing past an empty field never turns it red.
  const [typedIn, setTypedIn] = useState<Partial<Record<Field, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');

  // Two signals a person cannot produce: a field they never see, and a form
  // filled in faster than anyone can read it. The hidden field is named for
  // nothing a browser knows how to autofill, so no visitor's own browser can
  // put a value in it on their behalf.
  const [honeypot, setHoneypot] = useState('');
  const openedAt = useRef(Date.now());
  const copyTimer = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sending = status === 'sending';

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  function withField(current: ContactErrors, field: Field, message: string | undefined) {
    const next = { ...current };
    if (message) next[field] = message;
    else delete next[field];
    return next;
  }

  function update(field: Field, value: string) {
    const next = { ...payload, [field]: value };
    setPayload(next);
    setTypedIn((current) => ({ ...current, [field]: true }));
    if (status === 'sent' || status === 'failed') setStatus('idle');

    // A field already flagged is rechecked as it changes, so its message
    // keeps up with the correction and goes the moment it is right. A field
    // not flagged is left alone until the visitor moves on.
    if (errors[field]) {
      setErrors((current) => withField(current, field, validateContact(next)[field]));
    }
  }

  function leave(field: Field) {
    if (!typedIn[field]) return;
    setErrors((current) => withField(current, field, validateContact(payload)[field]));
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;

    const found = validateContact(payload);
    const invalid = FIELDS.filter((field) => found[field]);
    if (invalid.length > 0) {
      // Rendered first, so the field is announced with its error attached
      // when focus lands on it.
      flushSync(() => {
        setErrors(found);
        setAttempted(true);
        setStatus('idle');
      });
      formRef.current?.querySelector<HTMLElement>(`#contact-${invalid[0]}`)?.focus();
      return;
    }

    setErrors({});
    setAttempted(false);

    // A trapped submission is answered exactly like a real one. Telling a
    // script it failed only teaches it to come back differently.
    if (looksAutomated({ honeypot, elapsedMs: Date.now() - openedAt.current })) {
      finish();
      return;
    }

    setStatus('sending');
    try {
      await sendContact(payload);
      finish();
    } catch {
      setStatus('failed');
    }
  }

  function finish() {
    setStatus('sent');
    setPayload(empty);
    setTypedIn({});
  }

  function fieldProps(field: Field) {
    const error = errors[field];
    return {
      id: `contact-${field}`,
      value: payload[field],
      readOnly: sending,
      onBlur: () => leave(field),
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `contact-${field}-error` : undefined,
    };
  }

  function fieldError(field: Field) {
    return errors[field] ? (
      <span id={`contact-${field}-error`} className={styles.fieldError}>
        {errors[field]}
      </span>
    ) : null;
  }

  const needsFixing = attempted && Object.keys(errors).length > 0;

  return (
    <section className={styles.section} id="contact">
      <SectionHeading
        index="07 / Contact"
        title="Get in touch"
        lead="Open to software developer roles and client work."
      />

      <div className={styles.layout}>
        <div className={styles.reach}>
          <div className={styles.details}>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.emailRow}>
                <a className={styles.detailValue} href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
                <button
                  type="button"
                  className={styles.copy}
                  data-copied={copy === 'copied' || undefined}
                  onClick={copyEmail}
                >
                  {copy === 'copied' ? <Icon name="check" size={14} /> : null}
                  {copy === 'copied' ? 'Copied!' : 'Copy'}
                </button>
              </span>
              {/* Present from the start, so a screen reader is already
                  listening when the result is written into it. */}
              <span
                role="status"
                className={styles.copyStatus}
                data-note={copy === 'failed' || undefined}
              >
                {copy === 'copied' ? <span className={styles.srOnly}>Email address copied</span> : null}
                {copy === 'failed' ? (
                  <span className={styles.copyNote}>
                    Could not copy. The address is beside the button.
                  </span>
                ) : null}
              </span>
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

        <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.pair}>
            <div className={styles.field}>
              <label htmlFor="contact-name">Name</label>
              <input
                {...fieldProps('name')}
                onChange={(event) => update('name', event.target.value)}
                autoComplete="name"
              />
              {fieldError('name')}
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-email">Email</label>
              <input
                {...fieldProps('email')}
                type="email"
                onChange={(event) => update('email', event.target.value)}
                autoComplete="email"
              />
              {fieldError('email')}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-subject">Subject</label>
            <input {...fieldProps('subject')} onChange={(event) => update('subject', event.target.value)} />
            {fieldError('subject')}
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-message">Message</label>
            <textarea
              {...fieldProps('message')}
              rows={5}
              onChange={(event) => update('message', event.target.value)}
            />
            {fieldError('message')}
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
            <StatusBanner tone="error">
              Something went wrong. Please try again or email me directly at{' '}
              <a href={`mailto:${profile.email}`}>{profile.email}</a>.
            </StatusBanner>
          ) : null}

          {status === 'sent' ? (
            <StatusBanner tone="success">Message sent successfully! I'll get back to you soon.</StatusBanner>
          ) : null}

          <div className={styles.actions}>
            <button className={styles.submit} type="submit" disabled={sending}>
              {sending ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Sending...
                </>
              ) : (
                <>
                  Send message
                  <Icon name="arrow" size={18} />
                </>
              )}
            </button>

            {needsFixing ? <p className={styles.warning}>Please fix the highlighted fields.</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
