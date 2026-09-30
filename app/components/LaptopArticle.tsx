import Link from 'next/link';
import { AppDownloadLinks } from './SubscriptionChrome';
import { JsonLd } from './JsonLd';
import { getLaptopCopy } from '../content/laptopPage';
import { localizedPath, type Locale } from '../i18n';
import { faqPageSchema } from '../seo';

export function LaptopArticle({ locale }: { locale: Locale }) {
  const copy = getLaptopCopy(locale);
  const pricingHref = localizedPath(locale, 'pricing');

  return (
    <main className="subscription-main">
      <JsonLd data={faqPageSchema(copy.faq)} />
      <section className="subscription-section">
        <h1>{copy.h1}</h1>
        <p className="subscription-lead">{copy.lead}</p>
        <AppDownloadLinks />
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
        <h2>{copy.phoneHeading}</h2>
        <p className="subscription-lead">{copy.phoneBody}</p>
      </section>
      <section className="subscription-section">
        <h2>{copy.laptopHeading}</h2>
        <ul className="policy-list">
          {copy.laptopPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
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
