import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BlobBackground from '@/components/BlobBackground'

export const metadata = {
  title: 'Privacy Policy — Snobo Labs',
  description: 'How Snobo Labs collects, uses, and protects your information.',
}

export default function PrivacyPolicy() {
  return (
    <main className="relative">
      <BlobBackground />
      <Nav />

      <section className="relative z-5 px-[6vw] pt-32 pb-24 max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-[clamp(1.8rem,6vw,2.8rem)] mb-3">
          Privacy Policy
        </h1>
        <p className="text-xs text-grey-4 mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-grey-5 leading-relaxed text-sm">
          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-2">1. Information We Collect</h2>
            <p>
              When you submit a hire request, use our free website audit tool, or chat with our
              AI assistant, we collect information you provide directly — including your name,
              email, phone number, business name, and any details you share about your project.
              We also automatically collect basic technical data like page views, through Google
              Analytics, to understand how visitors use our site.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-2">2. How We Use Your Information</h2>
            <p>
              We use the information you provide to respond to your inquiries, deliver the
              services you request, and send you relevant updates about your project. We do not
              sell your personal information to third parties.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-2">3. Free Audit Tool</h2>
            <p>
              When you use our free website audit tool, we fetch publicly available data from the
              URL you provide and use AI to generate a report. We store your email and the
              generated report so we can follow up, but we do not access anything beyond your
              site's public HTML.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-2">4. AI Chat Widget</h2>
            <p>
              Conversations with our Snobo AI chat assistant are logged so we can review and
              improve responses. Avoid sharing sensitive personal information in chat that you
              wouldn't want stored.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-2">5. Data Storage &amp; Security</h2>
            <p>
              Your data is stored securely using industry-standard practices, including encrypted
              connections (HTTPS) and hashed passwords for any account credentials. We take
              reasonable steps to protect your information but cannot guarantee absolute security
              of data transmitted over the internet.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-2">6. Cookies</h2>
            <p>
              We use minimal cookies necessary for site functionality (such as keeping you logged
              into the admin panel) and, where enabled, Google Analytics cookies to understand
              site traffic.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-2">7. Your Rights</h2>
            <p>
              You can request access to, correction of, or deletion of your personal data at any
              time by contacting us directly at{' '}
              <a href="mailto:snobolabs.in@gmail.com" className="text-white underline">
                snobolabs.in@gmail.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-2">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Continued use of our site after
              changes means you accept the updated policy.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-white text-lg mb-2">9. Contact</h2>
            <p>
              Questions about this policy? Reach out at{' '}
              <a href="mailto:snobolabs.in@gmail.com" className="text-white underline">
                snobolabs.in@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}