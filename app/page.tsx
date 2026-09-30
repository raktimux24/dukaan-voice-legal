import { productAnswers } from './content/productAnswers';
import { faqPageSchema } from './seo';
import { HomeEffects } from './components/HomeEffects';
import { JsonLd } from './components/JsonLd';
import { LanguageSelectEffects } from './components/LanguageSelectEffects';
import { getLocalizedHtml } from './content/localized';
import { organizationSchema, softwareApplicationSchema, websiteSchema } from './seo';

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema, softwareApplicationSchema, faqPageSchema(productAnswers('en'))]} />
      <div lang="en-IN" dangerouslySetInnerHTML={{ __html: getLocalizedHtml('home', 'en') }} />
      <HomeEffects />
      <LanguageSelectEffects />
    </>
  );
}
