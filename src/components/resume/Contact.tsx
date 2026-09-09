import { useState } from 'react';
import { profile } from '../../data/resume';
import { sendContact, validateContact, type ContactPayload } from '../../lib/contact';
import SectionHeading from '../common/SectionHeading';
import { Icon } from '../common/icons';
import styles from './Contact.module.css';

const empty: ContactPayload = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [payload, setPayload] = useState<ContactPayload>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactPayload, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  function update(field: keyof ContactPayload, value: string) {
    setPayload((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validateContact(payload);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

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
        title="Let us talk"
        lead="Open to software developer roles and client work."
      />

      <div className={styles.layout}>
        <ul className={styles.details}>
          <li>
            <span className={styles.detailLabel}>Email</span>
            <a className={styles.detailValue} href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </li>
          <li>
            <span className={styles.detailLabel}>Phone</span>
            <a className={styles.detailValue} href={`tel:${profile.phone.replace(/\s/g, '')}`}>
              {profile.phone}
            </a>
          </li>
          <li>
            <span className={styles.detailLabel}>Location</span>
            <span className={styles.detailValue}>{profile.location}</span>
          </li>
        </ul>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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

          {status === 'failed' ? (
            <p className={styles.error} role="alert">
              That did not send. Please email {profile.email} directly.
            </p>
          ) : null}

          {status === 'sent' ? <p className={styles.sent}>Message sent. Thank you.</p> : null}

          <button className={styles.submit} type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending' : 'Send message'}
            <Icon name="arrow" size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
