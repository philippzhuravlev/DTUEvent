export function buildFacebookLoginUrl() {
  const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
  const FB_REDIRECT_URI = encodeURIComponent('https://europe-west1-dtuevent-8105b.cloudfunctions.net/fbAuth');
  const FB_SCOPES = [
    'pages_show_list',
    'pages_read_engagement'
  ].join(',');
  return `https://www.facebook.com/v23.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${FB_REDIRECT_URI}&scope=${FB_SCOPES}`;
}
