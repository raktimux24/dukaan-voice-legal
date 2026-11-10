export const privacyHtml = `<div class="reading-progress" id="readingProgress"></div>

  <div class="container" data-privacy-disclosures="2026-10-31">
    <a href="/" class="back">&larr; Back to home</a>
    <h1>Privacy Policy</h1>
    <p class="effective">Updated: 31 October 2026</p>

    <nav class="toc">
      <h3>Contents</h3>
      <ol>
        <li><a href="#s1">Information We Collect</a></li>
        <li><a href="#s2">How We Use Your Information</a></li>
        <li><a href="#s3">Third-Party Services</a></li>
        <li><a href="#s4">Data Storage & Security</a></li>
        <li><a href="#s5">Data Retention</a></li>
        <li><a href="#s6">Account Deletion</a></li>
        <li><a href="#s7">Data Sharing Within Shops</a></li>
        <li><a href="#s8">Children's Privacy</a></li>
        <li><a href="#s9">Your Rights</a></li>
        <li><a href="#s10">Changes to This Policy</a></li>
        <li><a href="#s11">Contact Us</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("we", "our", or "the App") is a voice-first collaborative inventory management application designed for Indian retail businesses. This Privacy Policy explains what information we collect, how we use it, who we share it with, and your rights regarding your data.</p>

    <p>By using Samaan-Bol, you agree to the collection and use of information as described in this policy.</p>

    <details open id="s1">
      <summary><h2>1. Information We Collect</h2></summary>
      <div class="section-content">
        <h3>1.1 Account Information</h3>
        <p>When you create an account, we collect:</p>
        <ul>
          <li><strong>Full name</strong> — provided during sign-up</li>
          <li><strong>Email address</strong> — used for authentication and account recovery</li>
          <li><strong>Password</strong> — encrypted and managed by our authentication provider (Clerk)</li>
        </ul>
        <p>If you sign in with Google or Apple, we receive your name and email from the OAuth provider. We do not access your Google or Apple account password.</p>

        <h3>1.2 Voice Recordings</h3><p>Voice recording is optional. Our API processes raw audio in memory and does not save it in our database. Sarvam AI also receives audio and text for speech recognition, language processing and speech output. Sarvam may retain API inputs and responses under its workspace settings and terms; immediate deletion at that provider is not promised. Model training is disabled for our organisation. Text transcripts and related actions remain in shop audit history and may appear in operational logs.</p>
<h3>1.3 Inventory & Business Data</h3><p>We store business data you create or upload: shop contact details, address and GST identity; customer and supplier contacts; products and stock; imported files and branding images; bills, purchases, orders, balances, expenses, cashbook, payments and audit history. Payment records can include shop UPI IDs and limited payment metadata. Complete card details are handled by the payment provider.</p>
<h3>1.4 User Preferences</h3>
        <ul>
          <li>App language and voice language selection</li>
          <li>Voice feedback preference (on/off)</li>
          <li>Display settings (high contrast mode, text size)</li>
          <li>Default measurement unit</li>
          <li>Notification preferences</li>
        </ul>

        <h3>1.5 Shop Membership Data</h3>
        <ul>
          <li>Your role in each shop (Owner, Manager, or Helper)</li>
          <li>Invite codes generated for team collaboration</li>
          <li>Last active timestamps within shops</li>
        </ul>

        <h3>1.6 Device & Diagnostic Data</h3><p>Production diagnostics include device and app identifiers, errors, navigation events and sampled performance data. These records can be linked to your account or device. Authentication providers also process IP addresses and approximate session location for security. We do not request precise GPS location or access to the device address book.</p></div>
    </details>

    <details id="s2">
      <summary><h2>2. How We Use Your Information</h2></summary>
      <div class="section-content"><p>We use data to operate inventory, billing, purchases, orders, payments and account features; verify identity and protect sessions; retain necessary business records; send essential verification and account messages; and diagnose reliability and performance problems. We do not sell personal data or use it for advertising.</p></div>
    </details>

    <details id="s3">
      <summary><h2>3. Third-Party Services</h2></summary>
      <div class="section-content"><p>Hosting and delivery providers, including Render, Expo and Brevo, process application data, connection metadata, app-update requests or verification-email details as needed for their functions. The services listed below process data under their applicable terms, privacy policies and retention settings.</p>
        <p>We use the following third-party services to operate the App:</p>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Purpose</th>
              <th>Data Shared</th>
              <th>Privacy Policy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>Authentication &amp; session management</td>
              <td>Email, name, OAuth tokens, session data</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">clerk.com/legal/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>Voice processing (Speech-to-Text, Natural Language Processing, Text-to-Speech)</td>
              <td>Audio recordings, transcript text, language code</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>Database hosting (PostgreSQL)</td>
              <td>All persisted application data</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Razorpay</strong></td>
              <td>Subscription payments, UPI Autopay mandates, invoices, refunds, and payment status updates</td>
              <td>Name, email, phone, billing address, payment metadata, invoice metadata, UPI handle or card last 4 where made available by Razorpay. Razorpay handles full sensitive payment credentials.</td>
              <td><a href="https://razorpay.com/privacy/" target="_blank" rel="noopener">razorpay.com/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>Error tracking &amp; crash reporting</td>
              <td>Crash reports, device information (production only)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>Each third-party service processes data according to their own privacy policy. We encourage you to review their policies.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. Data Storage & Security</h2></summary>
      <div class="section-content">
        <ul>
          <li>Application data is stored in a Neon PostgreSQL database with SSL/TLS encryption in transit</li>
          <li>Authentication tokens are stored on your device using secure storage (iOS Keychain / Android Keystore)</li>
          <li>API communication uses HTTPS encryption</li>
          <li>Sensitive endpoints are rate-limited to prevent abuse</li>
          <li>Passwords are hashed and managed by Clerk — we never store plaintext passwords</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. Data Retention</h2></summary>
      <div class="section-content"><p>Business records may need to be kept for tax, accounting, disputes and legal obligations. These can include bills, reserved invoice numbers, purchases, payments, cashbook and expense records, orders, related audit history and identity links. Required records are not erased automatically by an account-deletion request. We retain them for the applicable obligations and review requests for data that can be removed.</p></div>
    </details>

    <details id="s6">
      <summary><h2>6. Account Deletion</h2></summary>
      <div class="section-content">
<p>Use Settings → Delete Account on mobile or web. We check record retention before deletion.</p>
<p>If retention is required, self-service deletion is blocked and your account, shop records and sign-in identity remain. Contact support to request a closure review and removal of data that does not need to be retained.</p>
<p>Where deletion is allowed, eligible account and owned-shop data and shared-shop memberships are removed, then your Clerk sign-in identity is deleted. Deleting only a shop leaves your account active.</p>
<p>Allowed deletion is permanent; export needed data first. If a step fails or its result is uncertain, deletion is not confirmed—stay signed in and retry or contact support.</p><p><a href="/delete-account">Account Deletion</a></p><p><a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
</div>
    </details>

    <details id="s7">
      <summary><h2>7. Data Sharing Within Shops</h2></summary>
      <div class="section-content"><p>Shop data is available to authorised staff according to their roles. Public catalogue details and listed products become visible when the owner publishes the store. Customer order contact details are shared with the shop and holders of the private order tracking link. Sharing a document or link can disclose its contents to the recipient. Unpublishing hides the catalogue but does not delete retained orders or fiscal records.</p></div>
    </details>

    <details id="s8">
      <summary><h2>8. Children's Privacy</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. Your Rights</h2></summary>
      <div class="section-content">
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access your data:</strong> View your inventory, audit logs, and preferences within the App</li>
          <li>Request deletion or a retention review through Settings or by email. Required records may have to be kept.</li>
          <li><strong>Correct your data:</strong> Update inaccurate account, shop, or billing information where supported, or contact us for help</li>
          <li><strong>Request portability:</strong> Ask for a copy of your account and shop data in a reasonable portable format where required by applicable law</li>
          <li><strong>Control preferences:</strong> Modify your language, display, and voice settings at any time</li>
          <li><strong>Withdraw from shops:</strong> Leave any shop you are a member of</li>
        </ul>
      <p>You can email support to request removal of data that is not required, without deleting the whole account. We review the request against fiscal, accounting, dispute and legal retention obligations. Required records and their necessary identity links may remain; this is not an automatic deletion promise.</p><p><a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p></div>
    </details>

    <details id="s10">
      <summary><h2>10. Changes to This Policy</h2></summary>
      <div class="section-content">
        <p>We may update this Privacy Policy from time to time. When we do, we will update the "Effective Date" at the top of this page. We encourage you to review this policy periodically. Continued use of the App after changes constitutes acceptance of the updated policy.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. Contact Us</h2></summary>
      <div class="section-content">
        <p>If you have any questions about this Privacy Policy or your data, please contact us at:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">&copy; 2026 Samaan-Bol. All rights reserved.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">&uarr;</button>`;
