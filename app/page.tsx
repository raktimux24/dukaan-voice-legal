import { HomeEffects } from './components/HomeEffects';
import { JsonLd } from './components/JsonLd';
import { homeHtml } from './content/home';
import { organizationSchema, softwareApplicationSchema, websiteSchema } from './seo';

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema, softwareApplicationSchema]} />
      <div dangerouslySetInnerHTML={{ __html: homeHtml }} />
      <HomeEffects />
    </>
  );
}
