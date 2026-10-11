import { LegalDocument, LegalHeading } from "@/components/layout/LegalDocument";

export const metadata = {
  title: "Privacy Policy — Voxlate",
};

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy" updated="Last updated: August 2026">
      <section>
        <LegalHeading id="information-we-collect">1. Information We Collect</LegalHeading>
        <p>We collect information you provide directly to us, such as your name, email address, and other information you choose to provide when joining our waitlist or creating an account.</p>
      </section>

      <section>
        <LegalHeading id="how-we-use-your-information">2. How We Use Your Information</LegalHeading>
        <p>We use the information we collect to provide, maintain, and improve our services, communicate with you about our products and services, and comply with legal obligations.</p>
      </section>

      <section>
        <LegalHeading id="data-storage-and-security">3. Data Storage and Security</LegalHeading>
        <p>We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
      </section>

      <section>
        <LegalHeading id="data-sharing">4. Data Sharing</LegalHeading>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or as necessary to provide our services.</p>
      </section>

      <section>
        <LegalHeading id="your-rights">5. Your Rights</LegalHeading>
        <p>You have the right to access, correct, or delete your personal information at any time. You can do this by contacting us or through your account settings.</p>
      </section>

      <section>
        <LegalHeading id="cookies">6. Cookies</LegalHeading>
        <p>We use cookies and similar tracking technologies to enhance your experience on our platform. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
      </section>

      <section>
        <LegalHeading id="children-s-privacy">7. Children&apos;s Privacy</LegalHeading>
        <p>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.</p>
      </section>

      <section>
        <LegalHeading id="changes-to-privacy-policy">8. Changes to Privacy Policy</LegalHeading>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.</p>
      </section>

      <section>
        <LegalHeading id="contact-us">9. Contact Us</LegalHeading>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@voxlate.com.</p>
      </section>
    </LegalDocument>
  );
}
