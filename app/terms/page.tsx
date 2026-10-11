import Link from "next/link";
import { LegalDocument, LegalHeading } from "@/components/layout/LegalDocument";

export const metadata = {
  title: "Terms of Service — Voxlate",
};

const TOC = [
  { id: "about-voxlate", label: "1. About Voxlate" },
  { id: "acceptance-of-these-terms", label: "2. Acceptance of These Terms" },
  { id: "eligibility", label: "3. Eligibility" },
  { id: "user-responsibilities", label: "4. User Responsibilities" },
  { id: "acceptable-use", label: "5. Acceptable Use" },
  { id: "prohibited-uses", label: "6. Prohibited Uses" },
  { id: "artificial-intelligence", label: "7. Artificial Intelligence" },
  { id: "beta-features", label: "8. Beta Features" },
  { id: "intellectual-property", label: "9. Intellectual Property" },
  { id: "user-content", label: "10. User Content" },
  { id: "privacy", label: "11. Privacy" },
  { id: "service-availability", label: "12. Service Availability" },
  { id: "limitation-of-liability", label: "13. Limitation of Liability" },
  { id: "account-suspension-and-termination", label: "14. Account Suspension and Termination" },
  { id: "changes-to-the-services", label: "15. Changes to the Services" },
  { id: "changes-to-these-terms", label: "16. Changes to These Terms" },
  { id: "compliance-with-applicable-laws", label: "17. Compliance with Applicable Laws" },
  { id: "indemnification", label: "18. Indemnification" },
  { id: "disclaimer-of-warranties", label: "19. Disclaimer of Warranties" },
  { id: "force-majeure", label: "20. Force Majeure" },
  { id: "severability", label: "21. Severability" },
  { id: "waiver", label: "22. Waiver" },
  { id: "entire-agreement", label: "23. Entire Agreement" },
  { id: "governing-law-and-jurisdiction", label: "24. Governing Law and Jurisdiction" },
  { id: "contact", label: "25. Contact" },
  { id: "acknowledgement", label: "26. Acknowledgement" },
];

export default function TermsPage() {
  return (
    <LegalDocument title="Terms and Conditions" updated="Last Updated: August 5, 2026" toc={TOC}>
      <section>
        <p>
          Welcome to Voxlate. These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Voxlate website, applications, software, beta services, future hardware devices, and related products (collectively, the &quot;Services&quot;). By accessing or using Voxlate, you agree to comply with these Terms. If you do not agree with these Terms, please discontinue the use of our Services.
        </p>
      </section>

      <section>
        <LegalHeading id="about-voxlate">1. About Voxlate</LegalHeading>
        <p>
          Voxlate is an AI-powered real-time speech translation platform designed to help people communicate across different languages while preserving the speaker&apos;s natural voice, tone, and emotion.
        </p>
        <p>
          Our mission is to make communication seamless, accessible, secure, and inclusive for individuals, businesses, educational institutions, and organizations worldwide.
        </p>
      </section>

      <section>
        <LegalHeading id="acceptance-of-these-terms">2. Acceptance of These Terms</LegalHeading>
        <p>By creating an account, joining our waitlist, downloading our software, accessing beta features, or using any Voxlate Service, you confirm that:</p>
        <ul>
          <li>You have read and understood these Terms.</li>
          <li>You agree to comply with these Terms.</li>
          <li>You will use Voxlate responsibly, ethically, and lawfully.</li>
        </ul>
      </section>

      <section>
        <LegalHeading id="eligibility">3. Eligibility</LegalHeading>
        <p>To use Voxlate, you must:</p>
        <ul>
          <li>Comply with all applicable laws and regulations.</li>
          <li>Provide accurate registration information.</li>
          <li>Maintain the confidentiality of your account credentials.</li>
          <li>Be responsible for all activities performed through your account.</li>
        </ul>
      </section>

      <section>
        <LegalHeading id="user-responsibilities">4. User Responsibilities</LegalHeading>
        <p>Users agree to:</p>
        <ul>
          <li>Use the Services responsibly.</li>
          <li>Respect the rights and privacy of others.</li>
          <li>Maintain account security.</li>
          <li>Promptly report unauthorized account access.</li>
          <li>Use Voxlate only for lawful and legitimate purposes.</li>
        </ul>
      </section>

      <section>
        <LegalHeading id="acceptable-use">5. Acceptable Use</LegalHeading>
        <p>Voxlate may be used for purposes including:</p>
        <ul>
          <li>Personal communication</li>
          <li>Business meetings</li>
          <li>Remote collaboration</li>
          <li>Online education</li>
          <li>Customer support</li>
          <li>Accessibility assistance</li>
          <li>International communication</li>
          <li>Travel and tourism</li>
          <li>Research and innovation</li>
        </ul>
      </section>

      <section>
        <LegalHeading id="prohibited-uses">6. Prohibited Uses</LegalHeading>
        <p>Users shall not use Voxlate for any unlawful, fraudulent, harmful, abusive, or unethical activity. This includes but is not limited to:</p>
        <ul>
          <li>Financial fraud</li>
          <li>Identity theft</li>
          <li>Phishing</li>
          <li>Social engineering</li>
          <li>Scams</li>
          <li>Cybercrime</li>
          <li>Extortion</li>
          <li>Blackmail</li>
          <li>Harassment</li>
          <li>Distribution of malware</li>
          <li>Unauthorized surveillance</li>
          <li>Impersonation</li>
          <li>Terrorist or extremist activities</li>
          <li>Human trafficking</li>
          <li>Hate speech</li>
          <li>Money laundering</li>
          <li>Violating applicable laws</li>
        </ul>

        <aside>
          <h3>Fraud Prevention Policy</h3>
          <p>Voxlate exists to connect people—not to deceive them.</p>
          <p>The use of Voxlate by scam call centers, fraudulent organizations, cybercriminals, individuals involved in phishing, impersonation, financial fraud, identity theft, or any other illegal activity is strictly prohibited.</p>
          <p>Voxlate does not support, encourage, or authorize the use of its technology for unlawful activities.</p>
          <p>Where permitted by applicable law, Voxlate reserves the right to:</p>
          <ul>
            <li>Suspend or permanently terminate accounts.</li>
            <li>Restrict access to Services.</li>
            <li>Investigate suspected misuse.</li>
            <li>Preserve relevant records where legally required.</li>
            <li>Cooperate with lawful requests from competent authorities.</li>
          </ul>
        </aside>
      </section>

      <section>
        <LegalHeading id="artificial-intelligence">7. Artificial Intelligence</LegalHeading>
        <p>Voxlate uses artificial intelligence to process speech and generate translations.</p>
        <p>Users acknowledge that:</p>
        <ul>
          <li>AI-generated translations may occasionally contain inaccuracies.</li>
          <li>Translations should not be considered professional legal, medical, financial, or emergency advice.</li>
          <li>Users should independently verify important information before making critical decisions.</li>
        </ul>
      </section>

      <section>
        <LegalHeading id="beta-features">8. Beta Features</LegalHeading>
        <p>Certain Services may be released as Beta versions.</p>
        <p>Beta features may:</p>
        <ul>
          <li>Change without notice.</li>
          <li>Contain bugs.</li>
          <li>Be discontinued.</li>
          <li>Produce experimental results.</li>
        </ul>
      </section>

      <section>
        <LegalHeading id="intellectual-property">9. Intellectual Property</LegalHeading>
        <p>All software, AI models, algorithms, branding, trademarks, graphics, website content, user interfaces, documentation, source code, product designs, and related materials are the exclusive intellectual property of Voxlate or its licensors and are protected under applicable intellectual property laws.</p>
        <p>Users shall not:</p>
        <ul>
          <li>Copy</li>
          <li>Modify</li>
          <li>Sell</li>
          <li>Redistribute</li>
          <li>Reverse engineer</li>
          <li>Decompile</li>
          <li>Create derivative works</li>
          <li>Attempt unauthorized access</li>
        </ul>
        <p>without prior written permission from Voxlate.</p>
      </section>

      <section>
        <LegalHeading id="user-content">10. User Content</LegalHeading>
        <p>Users retain ownership of content they submit.</p>
        <p>By using Voxlate, users grant Voxlate a limited license to process such content solely for providing, maintaining, improving, securing, and operating the Services in accordance with the Privacy Policy.</p>
      </section>

      <section>
        <LegalHeading id="privacy">11. Privacy</LegalHeading>
        <p>The collection, storage, processing, and protection of personal information are governed by the Voxlate Privacy Policy.</p>
      </section>

      <section>
        <LegalHeading id="service-availability">12. Service Availability</LegalHeading>
        <p>Although Voxlate strives to provide reliable Services, uninterrupted availability cannot be guaranteed.</p>
        <p>Maintenance, updates, technical issues, internet failures, or circumstances beyond our control may temporarily affect service availability.</p>
      </section>

      <section>
        <LegalHeading id="limitation-of-liability">13. Limitation of Liability</LegalHeading>
        <p>To the maximum extent permitted by applicable law, Voxlate shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:</p>
        <ul>
          <li>Use of the Services.</li>
          <li>Inability to access the Services.</li>
          <li>AI-generated translation inaccuracies.</li>
          <li>Service interruptions.</li>
          <li>Data loss caused by circumstances beyond reasonable control.</li>
        </ul>
        <p>Users remain responsible for how they use translated information.</p>
      </section>

      <section>
        <LegalHeading id="account-suspension-and-termination">14. Account Suspension and Termination</LegalHeading>
        <p>Voxlate reserves the right to suspend or terminate accounts that:</p>
        <ul>
          <li>Violate these Terms.</li>
          <li>Engage in fraud or illegal activities.</li>
          <li>Attempt unauthorized access.</li>
          <li>Abuse or exploit the platform.</li>
          <li>Threaten the security or integrity of Voxlate.</li>
        </ul>
      </section>

      <section>
        <LegalHeading id="changes-to-the-services">15. Changes to the Services</LegalHeading>
        <p>Voxlate may modify, improve, suspend, or discontinue any feature or Service at any time.</p>
      </section>

      <section>
        <LegalHeading id="changes-to-these-terms">16. Changes to These Terms</LegalHeading>
        <p>These Terms may be updated periodically.</p>
        <p>Continued use of the Services after updates constitutes acceptance of the revised Terms.</p>
      </section>

      <section>
        <LegalHeading id="compliance-with-applicable-laws">17. Compliance with Applicable Laws</LegalHeading>
        <p>Users are solely responsible for ensuring that their use of Voxlate complies with all applicable local, national, and international laws and regulations.</p>
      </section>

      <section>
        <LegalHeading id="indemnification">18. Indemnification</LegalHeading>
        <p>Users agree to defend, indemnify, and hold harmless Voxlate, its founders, employees, contractors, affiliates, partners, licensors, and team members from any claims, liabilities, damages, expenses, legal fees, or losses arising from:</p>
        <ul>
          <li>Violation of these Terms.</li>
          <li>Misuse of the Services.</li>
          <li>Violation of applicable law.</li>
          <li>Infringement of third-party rights.</li>
        </ul>
      </section>

      <section>
        <LegalHeading id="disclaimer-of-warranties">19. Disclaimer of Warranties</LegalHeading>
        <p>The Services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis.</p>
        <p>Voxlate makes no guarantee regarding:</p>
        <ul>
          <li>Continuous availability.</li>
          <li>Error-free operation.</li>
          <li>Perfect translation accuracy.</li>
          <li>Fitness for a particular purpose.</li>
        </ul>
      </section>

      <section>
        <LegalHeading id="force-majeure">20. Force Majeure</LegalHeading>
        <p>Voxlate shall not be liable for delays or failures caused by events beyond reasonable control, including natural disasters, war, terrorism, government actions, internet outages, cyberattacks, labor disputes, pandemics, or power failures.</p>
      </section>

      <section>
        <LegalHeading id="severability">21. Severability</LegalHeading>
        <p>If any provision of these Terms is determined to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
      </section>

      <section>
        <LegalHeading id="waiver">22. Waiver</LegalHeading>
        <p>Failure by Voxlate to enforce any provision of these Terms shall not constitute a waiver of that provision or any other right.</p>
      </section>

      <section>
        <LegalHeading id="entire-agreement">23. Entire Agreement</LegalHeading>
        <p>These Terms, together with the Privacy Policy and any additional policies published by Voxlate, constitute the entire agreement between Voxlate and its users regarding the Services.</p>
      </section>

      <section>
        <LegalHeading id="governing-law-and-jurisdiction">24. Governing Law and Jurisdiction</LegalHeading>
        <p>These Terms shall be governed by the applicable laws of the jurisdiction in which Voxlate is legally established.</p>
        <p>Any dispute arising from these Terms shall first be attempted to be resolved through good-faith discussions. If a resolution cannot be reached, the dispute shall be subject to the jurisdiction of the competent courts where Voxlate is legally established, unless applicable law provides otherwise.</p>
      </section>

      <section>
        <LegalHeading id="contact">25. Contact</LegalHeading>
        <p>Questions regarding these Terms or reports of misuse may be submitted through Voxlate&apos;s official support channels listed on the website.</p>
      </section>

      <section>
        <LegalHeading id="acknowledgement">26. Acknowledgement</LegalHeading>
        <p>By accessing or using Voxlate, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.</p>
        <p>Thank you for supporting Voxlate&apos;s mission to eliminate language barriers through ethical, responsible, and innovative artificial intelligence.</p>
      </section>
      <p>
        The Voxlate Privacy Policy is published on its own page: <Link href="/privacy">read the Privacy Policy</Link>.
      </p>
    </LegalDocument>
  );
}
