const { createFacebookClient } = require('./client');

function createFacebookOAuth({ FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI }) {
  const client = createFacebookClient({ FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI });

  const getPagesFromCode = async (code) => {
    const short = await client.exchangeCodeForShortLivedToken(code);
    const long = await client.exchangeForLongLivedToken(short);
    return client.getPagesForUser(long);
  };

  return { getPagesFromCode };
}

module.exports = { createFacebookOAuth };