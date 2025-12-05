import { HttpStatusUtil } from '../utils';
import { Request, Response } from 'express'; // just the express res/req types, not Express
import { firestore } from 'firebase-admin';
import type { Dependencies } from '../utils';

// callback = sent back from Facebook after user authorizes app with a "code" in the URL.
// Because we're sending stuff over http, we also need to send back http responses (res)
// and input the recieved code from the HTTP request (req).

// This handler calls db, fb and secretManagerService (injected via deps) to exchange code for 
// tokens, get pages, and store tokens. Its async so it can await each step and handle errors.

export async function handleCallback(deps: Dependencies, req: Request, res: Response) {
  // we convert deps into individual consts ("destructuring") for ez access
  const { facebookService, secretManagerService, storageService, firestoreService } = deps;

  console.log('[CALLBACK] Handler invoked');
  console.log('[CALLBACK] Query params:', JSON.stringify(req.query));

  // 1. get code from HTTP request
  const code = String(req.query.code || '').trim();
  console.log('[CALLBACK] Extracted code:', code ? `${code.substring(0, 10)}...` : 'MISSING');
  if (!code) {
    console.error('[CALLBACK] ERROR: No code provided in request');
    return HttpStatusUtil.send(res, 400, 'Missing code');
  }

  try {
    console.log('[CALLBACK] Step 1/7: Attempting to exchange code for short-lived token');
    // 2. exchange code for tokens and pages
    const shortLivedToken = await facebookService.getShortLivedToken(code);
    console.log('[CALLBACK] Step 2/7: Short-lived token obtained successfully');

    console.log('[CALLBACK] Step 3/7: Exchanging short-lived token for long-lived token');
    // 3. exchange short-lived token for long-lived token
    const longLivedToken = await facebookService.getLongLivedToken(shortLivedToken);
    console.log('[CALLBACK] Step 4/7: Long-lived token obtained successfully');
    console.log('[CALLBACK] Long-lived token expires in:', longLivedToken.expiresIn, 'seconds');

    console.log('[CALLBACK] Step 5/7: Fetching user pages with long-lived token');
    // 4. get pages using long-lived token
    const pages = await facebookService.getPagesFromUser(longLivedToken.accessToken);
    console.log('[CALLBACK] Pages retrieved:', Array.isArray(pages) ? pages.length : 0, 'pages');

    if (!Array.isArray(pages) || pages.length === 0) {
      console.warn('[CALLBACK] WARNING: No pages returned from Facebook');
      return HttpStatusUtil.send(res, 200, 'No pages returned.');
    }
    console.log('[CALLBACK] Processing', pages.length, 'page(s)');
  
    for (const page of pages) {
      try {
          console.log(`[CALLBACK] Step 6/7: Processing page: ${page.id} (${page.name})`);
          // 5. store page token in Secret Manager
          console.log(`[CALLBACK] Storing token for page ${page.id}...`);
          await secretManagerService.addPageToken(page.id, page.accessToken, longLivedToken.expiresIn);
          console.log(`[CALLBACK] Token stored successfully for page ${page.id}`);
   
          // 6. store page "metadata"/info in Firestore
          const expiresInSeconds = longLivedToken.expiresIn || 5184000; // default to 60 days
          const tokenExpiresAtIso = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
          const tokenExpiresInDays = Math.ceil(expiresInSeconds / (60 * 60 * 24));
          console.log(`[CALLBACK] Step 7/7: Storing page metadata for ${page.id}...`);
          console.log(`[CALLBACK] Token expires in ${tokenExpiresInDays} days (${tokenExpiresAtIso})`);
          await firestoreService.addPage(page.id, {
            id: page.id,
            name: page.name,
            active: true,
            url: `https://facebook.com/${page.id}`,
            connectedAt: new Date().toISOString(),
            tokenRefreshedAt: firestore.FieldValue.serverTimestamp(),
            tokenStoredAt: firestore.FieldValue.serverTimestamp(),
            tokenExpiresAt: tokenExpiresAtIso,
            tokenExpiresInDays,
            tokenStatus: 'valid',
            lastRefreshSuccess: true,
          });
          console.log(`[CALLBACK] Page metadata stored successfully for ${page.id}`);
      } catch (e: any) {
        console.error(`[CALLBACK] ERROR: Failed to store page ${page.id}:`, e.message);
        console.error(`[CALLBACK] Stack trace:`, e.stack);
        throw e;
      }
    }
    // 7. success! 
    console.log(`[CALLBACK] SUCCESS: Callback completed. Stored ${pages.length} page token(s).`);
    res.send(`Stored ${pages.length} page token(s).`);
  
  } catch (err: any) {
    // fail...
    const msg = err.message || 'Facebook auth failed';
    console.error('[CALLBACK] CRITICAL ERROR:', msg);
    console.error('[CALLBACK] Error stack:', err.stack);
    console.error('[CALLBACK] Full error object:', JSON.stringify(err, null, 2));
 
    if (String(req.query.debug) === '1') {
        console.log('[CALLBACK] Debug mode enabled - returning detailed error');
        return HttpStatusUtil.send(res, 500, msg);
    }
    console.log('[CALLBACK] Debug mode disabled - returning generic error');
    HttpStatusUtil.send(res, 500, 'Facebook auth failed');
  }
}
