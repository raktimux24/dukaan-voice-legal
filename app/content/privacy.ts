export const privacyHtml = `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">&larr; Back to home</a>
    <h1>Privacy Policy</h1>
    <p class="effective">Effective Date: February 23, 2026</p>

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

        <h3>1.2 Voice Recordings</h3>
        <div class="highlight">
          <p><strong>Important:</strong> Voice recordings are processed in real-time and are <strong>not stored permanently</strong>. Audio is transmitted to our server, processed by Sarvam AI for speech recognition and natural language understanding, and immediately discarded after processing. Only the resulting text transcript is stored in your audit log for your reference.</p>
        </div>
        <ul>
          <li>Audio is recorded on your device (WAV format on iOS, M4A on Android)</li>
          <li>Recordings are limited to a maximum of 30 seconds</li>
          <li>Audio is sent to our server as encoded data via a secure connection</li>
          <li>After processing, the audio data is discarded from server memory</li>
          <li>Text transcripts are stored in your shop's audit log so you can review past actions</li>
        </ul>

        <h3>1.3 Inventory & Business Data</h3>
        <p>When you use the App, we store the business data you create:</p>
        <ul>
          <li>Shop information (name, category, preferred language)</li>
          <li>Product catalog (names, barcodes, categories, units, prices)</li>
          <li>Stock quantities, batch numbers, purchase dates, expiry dates, supplier names</li>
          <li>Buy list items and notes</li>
          <li>Audit logs recording inventory changes (action type, user, timestamp, transcript, confidence score)</li>
        </ul>

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

        <h3>1.6 Device & Diagnostic Data</h3>
        <p>In production builds, we use Sentry for crash reporting. This collects:</p>
        <ul>
          <li>Device type, operating system, and app version</li>
          <li>Crash reports and error stack traces</li>
          <li>Performance data (sampled at 20% of sessions)</li>
        </ul>
        <p>Crash reporting is disabled in development builds and can be minimized by the sampling rate we apply.</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. How We Use Your Information</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>Provide the service:</strong> Process voice commands, manage inventory, and sync data across your team</li>
          <li><strong>Authentication:</strong> Verify your identity and manage secure sessions</li>
          <li><strong>Audit trail:</strong> Maintain a log of inventory changes for accountability and review</li>
          <li><strong>Improve the service:</strong> Diagnose bugs and crashes through anonymized error reports</li>
          <li><strong>Communication:</strong> Send essential account-related notifications (e.g., password resets)</li>
          <li><strong>Subscription billing:</strong> Create and manage Razorpay subscription checkout, UPI Autopay mandates, invoices, refunds, cancellations, and payment-failure notices</li>
        </ul>
        <p>We do <strong>not</strong> use your data for advertising, and we do <strong>not</strong> sell your personal information to third parties.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. Third-Party Services</h2></summary>
      <div class="section-content">
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
      <div class="section-content">
        <ul>
          <li><strong>Voice audio:</strong> Ephemeral — processed in memory and immediately discarded. Never stored on our servers.</li>
          <li><strong>Transcripts & audit logs:</strong> Retained as long as your account is active, for your reference.</li>
          <li><strong>Inventory data:</strong> Retained as long as your account is active.</li>
          <li><strong>Account data:</strong> Retained until you delete your account.</li>
          <li><strong>Crash reports:</strong> Retained according to Sentry's data retention policy (typically 90 days).</li>
          <li><strong>Subscription and billing records:</strong> Retained as long as needed for account management, tax, invoice, dispute, refund, and legal compliance obligations.</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. Account Deletion</h2></summary>
      <div class="section-content">
        <p>You can delete your account at any time from <strong>Settings &gt; Delete Account</strong> within the App. When you delete your account:</p>
        <ul>
          <li>All shops you own are permanently deleted, including all products, inventory, batches, buy lists, and AI predictions</li>
          <li>All your audit logs and preferences are permanently deleted</li>
          <li>Your memberships in other users' shops are removed</li>
          <li>Your authentication account with Clerk is permanently deleted</li>
        </ul>
        <p><strong>This action is irreversible.</strong> Once deleted, your data cannot be recovered.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. Data Sharing Within Shops</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol is a collaborative tool. When you are a member of a shop:</p>
        <ul>
          <li>All shop members (Owners, Managers, Helpers) can see the shop's inventory data, product catalog, and audit logs</li>
          <li>Your name, role, and activity timestamps are visible to other shop members</li>
          <li>Owners can manage membership and access for their shop</li>
        </ul>
        <p>We do not share your data with shops you are not a member of, nor with any unrelated third parties.</p>
      </div>
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
          <li><strong>Delete your data:</strong> Use the account deletion feature in Settings</li>
          <li><strong>Correct your data:</strong> Update inaccurate account, shop, or billing information where supported, or contact us for help</li>
          <li><strong>Request portability:</strong> Ask for a copy of your account and shop data in a reasonable portable format where required by applicable law</li>
          <li><strong>Control preferences:</strong> Modify your language, display, and voice settings at any time</li>
          <li><strong>Withdraw from shops:</strong> Leave any shop you are a member of</li>
        </ul>
      </div>
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
