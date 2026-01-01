import React from "react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 md:px-16 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-[#d49217] mb-4">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: November 2025</p>

        <section className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Welcome to our website. By accessing or using this website, you agree
            to be bound by these Terms and Conditions. Please read them carefully
            before using our services. If you do not agree with any part of these
            terms, you must not use this website.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using our website, you confirm that you have read,
              understood, and agreed to comply with these Terms and Conditions and
              our Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              2. Use of the Website
            </h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>You agree to use this website only for lawful purposes.</li>
              <li>
                You shall not attempt to gain unauthorized access to any part of
                the website or interfere with its operation.
              </li>
              <li>
                You must not use the website to distribute harmful or malicious
                content (including viruses or malware).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              3. Intellectual Property Rights
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this website, including text, graphics, logos, and
              designs, is the property of this website or its licensors and is
              protected by copyright and trademark laws. You may not copy,
              reproduce, or distribute any part of this content without written
              permission.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              4. User Accounts
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you create an account on our website, you are responsible for
              maintaining the confidentiality of your login information and for
              all activities that occur under your account. You agree to notify us
              immediately of any unauthorized access or use of your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              5. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to keep all information accurate and up to date, but we do
              not guarantee that the website will always be available, error-free,
              or complete. We are not responsible for any direct, indirect, or
              consequential losses arising from the use of our website.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              6. Third-Party Links
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites. We are not
              responsible for the content, policies, or practices of those sites.
              Accessing them is at your own risk.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              7. Termination of Access
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your access to the
              website at any time, without notice, for any reason, including
              violation of these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              8. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms and Conditions from time to time. The
              updated version will be posted on this page with the revised date.
              Continued use of the website after any changes constitutes acceptance
              of the new terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              9. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions are governed by and construed in
              accordance with the laws of your local jurisdiction. Any disputes
              will be subject to the exclusive jurisdiction of the courts in that
              area.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              10. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions about these Terms and Conditions, please contact us
              at{" "}
              <a
                href="mailto:legal@yourdomain.com"
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
