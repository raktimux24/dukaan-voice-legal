import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { getUdhaarCopy } from '../content/udhaarPage';
import { localizedPath, type Locale } from '../i18n';
import { faqPageSchema } from '../seo';

export function UdhaarArticle({ locale }: { locale: Locale }) {
  const copy = getUdhaarCopy(locale);
  const pricingHref = localizedPath(locale === 'hi' ? 'hi' : 'en', 'pricing');
  const laptopHref = localizedPath(locale === 'hi' ? 'hi' : 'en', 'laptop');

  return (
    <main className="subscription-main">
      <JsonLd data={faqPageSchema(copy.faq)} />
      <section className="subscription-section">
        <h1>{copy.h1}</h1>
        <p className="subscription-lead">{copy.lead}</p>
        <div className="subscription-actions">
          <Link className="subscription-button" href="/shop">
            {copy.openShop}
          </Link>
          <Link className="subscription-button secondary" href={pricingHref}>
            {copy.pricing}
          </Link>
        </div>
      </section>
      <section className="subscription-section">
        <h2>{copy.stepsHeading}</h2>
        <ol className="step-list">
          {copy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <section className="subscription-section">
        <h2>{copy.nameHeading}</h2>
        <p className="subscription-lead">{copy.nameBody}</p>
      </section>
      <section className="subscription-section">
        <h2>{copy.premiumHeading}</h2>
        <ul className="policy-list">
          {copy.premiumPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
      <section className="subscription-section">
        <h2>{copy.notHeading}</h2>
        <ul className="note-list">
          {copy.notPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="subscription-lead">
          <Link href={laptopHref}>{copy.laptop}</Link>
        </p>
      </section>
      <section className="subscription-section">
        <h2>{copy.faqHeading}</h2>
        <div className="faq-list">
          {copy.faq.map((item) => (
            <details key={item.q} open>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
