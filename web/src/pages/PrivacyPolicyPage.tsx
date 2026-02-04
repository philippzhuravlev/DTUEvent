import { useNavigate } from 'react-router-dom';

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 prose prose-invert">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-[var(--link-primary)] hover:underline font-semibold"
        >
          ← Back to Events
        </button>

        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        
        <p className="text-[var(--text-subtle)]">
          <strong>Last Updated:</strong> February 4, 2026<br />
          <strong>Effective Date:</strong> December 25, 2025
        </p>

        <p>
          This Privacy Policy explains how DTUEvent ("we", "us", "our") handles information in connection with the
          Service. DTUEvent is designed to be a read-only event aggregator. We do not create user accounts, and we do
          not track visitors for advertising.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. What we do not collect about visitors</h2>
        <p>
          When you browse DTUEvent, we do not ask you to sign in and we do not intentionally collect personal
          information about you such as your name, email address, Facebook profile data, location, or your event
          RSVPs/interests. We do not use analytics products or ad pixels to identify you.
        </p>
        <p>
          Like most web services, our hosting platform may generate technical logs (for example timestamps, HTTP status
          codes, and error messages). We use such logs only to keep the Service secure and reliable, and not to profile
          individual users.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Information we collect to run the Service</h2>
        <p>
          DTUEvent stores public event information and related Page metadata needed to display the calendar and keep it
          up to date. This may include event titles, descriptions, dates/times, locations, cover images, event URLs, and
          aggregated engagement counts.
        </p>
        <p>
          If you are a Facebook Page admin and you use the “Link Facebook” flow, DTUEvent stores a Page access token
          (encrypted in Google Cloud Secret Manager), Page metadata (such as Page ID, name, and URL), and token expiry
          information to keep the syncing working. We do not store your Facebook profile identity (such as user ID, name,
          email, or profile photo).
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. How we use the information</h2>
        <p>
          We use stored information only to display public events in a unified calendar, keep connected Pages synced,
          operate and secure the Service, and comply with legal obligations where applicable.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Data retention</h2>
        <p>
          We keep data for as long as it is reasonably necessary to operate the Service. Event data is retained until an
          event has passed, plus approximately 30 days. Page metadata is retained while a Page is connected. Page access
          tokens are retained for the duration of token validity and for a short period after expiry (up to 7 days) to
          support refresh and operational auditing. Security logs follow Google Cloud/Firebase default retention (commonly
          around 30 days), and internal sync logs may be retained for up to 90 days.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Deletion Instructions (Facebook/Meta)</h2>
        <p>
          If you are a Facebook Page admin who previously linked a Page to DTUEvent, you can request deletion of the
          Facebook Platform data we store for that Page in either of these ways:
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Revoke access in Facebook</strong>
            <ul className="list-disc pl-6 mt-2">
              <li>Go to Facebook Settings → <strong>Business Integrations</strong> (or Apps and Websites)</li>
              <li>Find <strong>DTUEvent</strong></li>
              <li>Click <strong>Remove</strong> / <strong>Revoke</strong></li>
            </ul>
          </li>
          <li>
            <strong>Email us</strong>
            <ul className="list-disc pl-6 mt-2">
              <li>
                Email{' '}
                <a
                  href="mailto:philippzhuravlev@gmail.com"
                  className="text-[var(--link-primary)] hover:underline"
                >
                  philippzhuravlev@gmail.com
                </a>{' '}
                or{' '}
                <a
                  href="mailto:crillerhylle@gmail.com"
                  className="text-[var(--link-primary)] hover:underline"
                >
                  crillerhylle@gmail.com
                </a>
                , and include the Facebook Page URL and/or Page ID you want removed.
              </li>
            </ul>
          </li>
        </ol>
        <p>
          After revocation or a verified deletion request, we delete the Page access token (Google Cloud Secret
          Manager) and the associated Page/event data (Firestore) within <strong>24 hours</strong>.
        </p>
        <p>
          <strong>Visitors (non-admin users):</strong> DTUEvent does not store personal user data, so there is typically nothing
          to delete for ordinary website visitors.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Your rights (GDPR / Danish data protection)</h2>
        <p>
          Because DTUEvent does not maintain visitor user accounts or profiles, we typically do not hold personal data
          about website visitors that would be provided through an access request. If you are a Page admin who linked a
          Page and you want the token and synced data deleted, please follow the deletion instructions above.
        </p>
        <p>
          If you have questions or want to exercise applicable rights, contact us at{' '}
          <a href="mailto:philippzhuravlev@gmail.com" className="text-[var(--link-primary)] hover:underline">
            philippzhuravlev@gmail.com
          </a>{' '}
          or{' '}
          <a href="mailto:crillerhylle@gmail.com" className="text-[var(--link-primary)] hover:underline">
            crillerhylle@gmail.com
          </a>
          . You may also lodge a complaint with the Danish Data Protection Authority (Datatilsynet).
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Third-party services</h2>
        <p>
          DTUEvent relies on Meta/Facebook and Google Firebase/Google Cloud to operate. Each provider’s privacy policy
          applies to their services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. Cookies and tracking</h2>
        <p>
          DTUEvent does not use cookies for cross-site tracking, advertising, or analytics. Your browser or third-party
          platforms may set cookies outside of DTUEvent’s control.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">9. Security</h2>
        <p>
          We use reasonable safeguards designed to protect data. Page access tokens are stored server-side and
          encrypted at rest in Google Cloud Secret Manager, and communications are protected with HTTPS/TLS. No
          security measure is perfect, and we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact</h2>
        <p>
          <strong>Questions about this Privacy Policy:</strong><br />
          Email: <a href="mailto:philippzhuravlev@gmail.com" className="text-[var(--link-primary)] hover:underline">philippzhuravlev@gmail.com</a> or <a href="mailto:crillerhylle@gmail.com" className="text-[var(--link-primary)] hover:underline">crillerhylle@gmail.com</a><br />
          GitHub Issues: <a href="https://github.com/philippzhuravlev/DTUEvent/issues" className="text-[var(--link-primary)] hover:underline">github.com/philippzhuravlev/DTUEvent/issues</a>
        </p>

        <hr className="my-8 border-[var(--border-color)]" />

        <p className="text-[var(--text-subtle)] italic">
          <strong>Last Reviewed:</strong> February 4, 2026
        </p>
      </div>
    </div>
  );
}
