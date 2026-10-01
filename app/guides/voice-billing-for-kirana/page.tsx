import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { JsonLd } from '../../components/JsonLd';
import { SubscriptionNav, SubscriptionFooter, AppDownloadLinks } from '../../components/SubscriptionChrome';
import { HomeEffects } from '../../components/HomeEffects';
import { absoluteUrl, pageMetadata, faqPageSchema, organizationSchema } from '../../seo';

const path = '/guides/voice-billing-for-kirana';
const title = 'How to use voice billing in a kirana store — Samaan Bol';
const description = 'A practical Samaan Bol guide: set up products, speak a sale, check quantities, take cash or UPI, record udhaar and share the bill. Voice needs internet.';
const faq = [
  { q: 'What should I check before completing a voice bill?', a: 'Check the matched product, quantity, unit, price and customer. A spoken command can be misheard, especially in a noisy shop. Correct the cart before you complete the sale.' },
  { q: 'What if an item is not recognized?', a: 'Check whether the product exists in your shop catalogue. Search or select it manually, then check its quantity and price. Do not accept a different product simply because its name sounds similar.' },
  { q: 'Can a spoken command confirm UPI payment?', a: 'No. Showing a UPI QR and receiving payment are separate steps. Confirm the payment yourself before marking the sale as paid.' },
  { q: 'Can the owner use a laptop while a helper uses a phone?', a: 'Yes. Use the same shop with the appropriate team membership. Voice input stays on the phone; browser billing uses search or barcode scanning.' },
];
export const metadata: Metadata = pageMetadata({ title, description, path, languageAlternates: false });

export default function VoiceBillingGuide() {
  return <>
    <JsonLd data={[organizationSchema, {
      '@context': 'https://schema.org', '@type': 'Article', '@id': absoluteUrl(path+'#article'),
      headline: title, description, inLanguage: 'en-IN', mainEntityOfPage: absoluteUrl(path),
      author: { '@type': 'Organization', name: 'Samaan Bol', url: absoluteUrl('/') },
      publisher: { '@id': absoluteUrl('/#organization') }, datePublished: '2026-10-01', dateModified: '2026-10-01',
    }, faqPageSchema(faq)]} />
    <SubscriptionNav page="home" showLanguageSwitcher={false} />
    <main className="subscription-main guide-main">
      <nav aria-label="Breadcrumb"><Link href="/">Samaan Bol</Link> / Voice billing guide</nav>
      <article>
        <header className="subscription-section">
          <p className="guide-byline">By Samaan Bol · Updated 1 October 2026 · English guide</p>
          <h1>How to use voice billing in a kirana store</h1>
          <p className="subscription-lead">Voice billing turns the items you say into a draft bill. With Samaan Bol, you speak on your phone, review the cart, choose cash, UPI or udhaar, then complete and share the bill. Stock updates with the completed sale. Voice processing needs an internet connection.</p>
          <AppDownloadLinks />
          <p>Free to download. Voice is a Premium feature, with a 7-day in-app trial for new shops. <Link href="/pricing">See the free plan and Premium pricing</Link>.</p>
        </header>
        <section className="subscription-section">
          <h2>Before the first customer</h2>
          <p>Create your shop in the app and add the products you sell. Check names, selling prices and units. “Rice” sold by the kilogram is different from a fixed-price rice packet. Add opening stock so later stock changes have a useful starting point.</p>
          <p>Choose your voice language and allow microphone access when you want to speak. Try a familiar item before using it during a busy sale. Review the recognized product and quantity; speech recognition can make mistakes.</p>
        </section>
        <section className="subscription-section">
          <h2>Make a sale in five steps</h2>
          <ol className="step-list">
            <li><strong>Speak the item and quantity.</strong> For example, “चावल 5 किलो बेचा” means rice, five kilograms, sold. Use a name that matches a product in your shop.</li>
            <li><strong>Review the bill.</strong> Check the product, unit, quantity and price. Correct anything the app heard incorrectly. The voice command prepares the sale; it does not collect money.</li>
            <li><strong>Choose cash, UPI or udhaar.</strong> For cash, check the amount received. For UPI, show the QR and confirm receipt yourself. For udhaar, select the correct customer so the sale is attached to their name.</li>
            <li><strong>Complete the sale once.</strong> Check the completed bill before repeating a command, especially after a slow response. This helps avoid accidentally recording the same purchase twice.</li>
            <li><strong>Share and review.</strong> Share the bill on WhatsApp if the customer wants it. Check today’s sales and stock after completion. The stock change belongs to the sale; you do not need to record it again as a separate stock removal.</li>
          </ol>
          <p>This is an example workflow, not a claim that every spoken sentence will be recognized correctly. Shop noise, product names and pronunciation can affect the result.</p>
        </section>
        <section className="subscription-section">
          <h2>A real checkout, from cart to stock update</h2>
          <p>These Hindi screenshots show Samaan Bol v1.0.10 on an iPhone simulator, captured on 1 October 2026 using demo-shop data. We selected the product manually for this example; the screenshots demonstrate checkout and stock updates, not speech recognition.</p>
          <p>Two kilograms of Sona Masoori Rice at ₹76/kg made a ₹152 cash bill. After completing it once, bill #91 appeared in sales and the available stock fell from 26.25 kg to 24.25 kg.</p>
          <div className="billing-demo-grid">
            {[
              { file: 'cart', title: '1. Review the cart', alt: 'Hindi cart with 2 kg Sona Masoori Rice at 76 rupees per kilogram, total 152 rupees.', caption: 'Check the product, quantity and price before continuing.' },
              { file: 'payment', title: '2. Choose the payment record', alt: 'Hindi checkout showing cash, UPI, udhaar and split payment options for a 152 rupee bill.', caption: 'This example uses cash. Confirm the amount received before completing the bill.' },
              { file: 'sale', title: '3. Verify the saved sale', alt: 'Today’s sales showing completed cash bill 91 for 152 rupees and one bill in total.', caption: 'The completed bill appears in today’s sales. This is demo data, not customer revenue.' },
              { file: 'stock', title: '4. Check remaining stock', alt: 'Sona Masoori Rice product search showing 24.25 kilograms remaining after the two kilogram sale.', caption: 'Stock changed by 2 kg, from 26.25 kg to 24.25 kg, without a separate stock-removal entry.' },
            ].map(({file,title,alt,caption}) => <figure key={file}>
              <h3>{title}</h3>
              <a href={`/images/billing-demo/${file}.png`} aria-label={`Open full screenshot: ${title}`}>
                <Image src={`/images/billing-demo/${file}.png`} alt={alt} width={792} height={1704} sizes="(max-width: 640px) 90vw, 360px" />
              </a>
              <figcaption>{caption}</figcaption>
            </figure>)}
          </div>
          <AppDownloadLinks />
        </section>
        <section className="subscription-section">
          <h2>Choose the right payment record</h2>
          <div className="guide-table"><table><caption>Cash, UPI and udhaar at the counter</caption><thead><tr><th scope="col">Method</th><th scope="col">What to check</th></tr></thead><tbody>
            <tr><th scope="row">Cash</th><td>The customer has paid the cash amount. Keep the paid sale separate from money still owed.</td></tr>
            <tr><th scope="row">UPI</th><td>The QR shows the bill amount. Check payment receipt yourself; displaying a QR does not confirm payment.</td></tr>
            <tr><th scope="row">Udhaar</th><td>The customer name is correct and the amount is owed. The outstanding list and reminders are Premium features.</td></tr>
          </tbody></table></div>
          <p><Link href="/udhaar">Read how udhaar stays connected to the bill</Link>.</p>
        </section>
        <section className="subscription-section">
          <h2>When voice is not the right input</h2>
          <p>If the shop is noisy or a name is repeatedly misheard, use manual product selection or barcode scanning and check the quantity. If there is no internet connection, do not rely on voice processing. Avoid repeating a sale until you know whether the previous attempt completed.</p>
          <p>On a laptop, use search or scanning in the browser. There is no laptop voice billing. <Link href="/billing-on-a-laptop">See the phone and laptop workflow</Link>.</p>
        </section>
        <section className="subscription-section">
          <h2>Questions at the counter</h2>
          <div className="faq-list">{faq.map(({q,a})=><details key={q} open><summary>{q}</summary><p>{a}</p></details>)}</div>
        </section>
        <section className="subscription-section">
          <h2>Try it with your own products</h2>
          <p>Start with a few familiar products and verify the quantities, prices and stock changes before using voice at a busy counter.</p>
          <AppDownloadLinks />
          <p><Link href="/contact">Need help with setup?</Link> Contact the Samaan Bol team.</p>
        </section>
      </article>
    </main>
    <SubscriptionFooter page="home" />
    <HomeEffects />
  </>;
}
