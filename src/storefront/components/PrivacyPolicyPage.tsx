import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 md:px-16 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-[#d49217] mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: November 2025
        </p>

        <section className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you visit
            our website. Please read this policy carefully to understand our
            practices and how we protect your personal data.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may collect information that you voluntarily provide such as your
              name, email address, and contact details. We also collect
              non-personal data automatically through cookies, analytics, and
              usage logs to enhance your browsing experience.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>To improve website functionality and user experience.</li>
              <li>To respond to your inquiries or feedback.</li>
              <li>To send updates or promotional content (only with your consent).</li>
              <li>To analyze site traffic and performance.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              3. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our website uses cookies to remember your preferences and gather
              analytics data. You can control or delete cookies in your browser
              settings. By using our site, you consent to our use of cookies as
              described in this policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell or rent your personal data. We may share limited
              information with trusted partners (like hosting or analytics
              providers) only to operate and improve our website, under strict
              confidentiality.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              5. Your Rights and Choices
            </h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Access, correct, or delete your personal data.</li>
              <li>Withdraw consent for marketing communications.</li>
              <li>Opt-out of cookies via your browser settings.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              6. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use secure technologies and best practices to protect your data
              from unauthorized access, alteration, or disclosure. However, no
              online system is completely secure, and we cannot guarantee absolute
              security.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              7. Third-Party Links
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to external sites. We are not
              responsible for the content or privacy practices of those websites.
              We encourage you to review their respective privacy policies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              8. Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. The updated version
              will be posted on this page with a revised date. Continued use of
              our website after changes means you accept those updates.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              9. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle
              your data, please contact us at{" "}
              <a
                href="mailto:privacy@yourdomain.com"
                className="text-[#d49217] hover:text-[#b87a12] transition-colors cursor-pointer"
              >
                kailashkalamkari1984@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
