import { createHash } from 'node:crypto';
import { productAnswers } from './content/productAnswers';
import { faqPageSchema } from './seo';
import { HomeEffects } from './components/HomeEffects';
import { JsonLd } from './components/JsonLd';
import { LanguageSelectEffects } from './components/LanguageSelectEffects';
import { getLocalizedHtml } from './content/localized';
import { organizationSchema, softwareApplicationSchema, websiteSchema } from './seo';

export default function HomePage() {
  const html = getLocalizedHtml('home', 'en');
  // Raw HTML can be replaced while client effects survive a refresh. Remount
  // their listeners and observers whenever the rendered content changes.
  const contentRevision = createHash('sha256').update(html).digest('hex');

  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema, softwareApplicationSchema, faqPageSchema(productAnswers('en'))]} />
      <div lang="en-IN" dangerouslySetInnerHTML={{ __html: html }} />
      <HomeEffects key={contentRevision} />
      <LanguageSelectEffects key={`language-${contentRevision}`} />
    </>
  );
}
