import { useNavigate } from 'react-router-dom';

export function TermsAndConditionsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-4 md:px-6">
        <button
          onClick={() => navigate('/')}
          className="text-[var(--link-primary)] hover:text-[var(--link-hover)] font-semibold flex items-center gap-2"
        >
          ← Back to Events
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 prose prose-invert">
        <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
        
        <p className="text-[var(--text-subtle)]">
          <strong>Last Updated:</strong> February 4, 2026<br />
          <strong>Effective Date:</strong> December 25, 2025
        </p>

        <p>
          These Terms and Conditions ("Terms") govern your access to and use of DTUEvent (the "Service"). By
          accessing or using the Service, you agree to these Terms.
        </p>

        <p>
          DTUEvent is not a social network or user platform. We are a read-only event aggregator. We do not create user
          accounts, profile you, or track you for advertising, and we do not store personal data about ordinary website
          visitors.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. What the Service is</h2>
        <p>
          DTUEvent is a read-only event aggregator for the DTU campus community. It displays public event information
          sourced from Facebook Pages and links back to the original event pages.
        </p>
        <p>
          DTUEvent is not a social network and does not offer user accounts, user profiles, or tracking-based
          advertising.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Facebook linking (for Page admins)</h2>
        <p>
          DTUEvent includes an optional “Link Facebook” flow intended for Facebook Page admins who want to help DTUEvent
          discover new event sources.
        </p>
        <p>
          When you link Facebook, we request limited permissions (<code>pages_show_list</code> and{' '}
          <code>pages_read_engagement</code>) and exchange the authorization code for a Page access token. DTUEvent does not
          store or keep your personal identity from this flow, and we do not store your Facebook profile information
          (such as name, email, profile photo, or user ID).
        </p>
        <p>
          To operate the Service, we store the Page access token (encrypted in Google Cloud Secret Manager), Page
          metadata (such as Page ID, name, URL, and connection timestamps), and token expiry information for refresh
          scheduling.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Event and Page data</h2>
        <p>
          DTUEvent stores public event information and related Page metadata needed to display the calendar and keep it
          up to date. This may include event titles, descriptions, dates/times, locations, cover images, event URLs, and
          aggregated engagement counts (for example interest/attendance counts). DTUEvent does not store individual
          attendee identities, comments, or personal RSVP data.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Using DTUEvent</h2>
        <p>
          You agree to use the Service lawfully and in a way that does not harm the Service or its users. You may not
          attempt to scrape, probe, reverse engineer, or disrupt the Service, bypass security controls, or use the
          Service to violate applicable laws or third-party terms.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Third-party services</h2>
        <p>
          DTUEvent relies on third-party services to function, including Meta/Facebook APIs and Google Cloud/Firebase
          services (hosting, database, and secure secret storage). Those third parties have their own terms and
          policies, and your use of the Service is also subject to them.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Data deletion (Facebook/Meta)</h2>
        <p>
          If you are a Facebook Page admin who previously linked a Page, you may request deletion of the Page access
          token and associated synced Page/event data by revoking access in Facebook Settings → Business Integrations
          (or Apps and Websites), or by emailing{' '}
          <a href="mailto:philippzhuravlev@gmail.com" className="text-[var(--link-primary)] hover:underline">
            philippzhuravlev@gmail.com
          </a>{' '}
          or{' '}
          <a href="mailto:crillerhylle@gmail.com" className="text-[var(--link-primary)] hover:underline">
            crillerhylle@gmail.com
          </a>{' '}
          with the Facebook Page URL and/or Page ID. After revocation or a verified request, we delete the token and
          the associated synced data within <strong>24 hours</strong>.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Disclaimers</h2>
        <p>
          The Service is provided on an “AS IS” and “AS AVAILABLE” basis. We do not guarantee continuous availability
          or the accuracy of third-party event information.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, DTUEvent will not be liable for indirect, incidental, special,
          consequential, or punitive damages arising out of or related to your use of the Service, including issues
          caused by third-party services or API downtime.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">9. Governing law</h2>
        <p>
          These Terms are governed by the laws of Denmark.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact</h2>
        <p>
          Questions about these Terms or our practices?<br />
          Email: <a href="mailto:philippzhuravlev@gmail.com" className="text-[var(--link-primary)] hover:underline">philippzhuravlev@gmail.com</a> or <a href="mailto:crillerhylle@gmail.com" className="text-[var(--link-primary)] hover:underline">crillerhylle@gmail.com</a><br />
          GitHub: <a href="https://github.com/philippzhuravlev/DTUEvent" className="text-[var(--link-primary)] hover:underline">github.com/philippzhuravlev/DTUEvent</a>
        </p>
      </div>
    </div>
  );
}