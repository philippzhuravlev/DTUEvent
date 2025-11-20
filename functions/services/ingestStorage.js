const fetch = require('node-fetch');
const { getExtFromContentType } = require('../utils/mime');

async function rehostCoverOrValidate({ bucket, docId, coverSource }) {
  if (!coverSource) return undefined;

  if (bucket && bucket.name) {
    try {
      const imgRes = await fetch(coverSource);
      if (!imgRes.ok) {
        console.warn(`Failed to fetch cover image for ${docId}: HTTP ${imgRes.status}`);
        return undefined;
      }

      const contentType = imgRes.headers.get('content-type') || 'application/octet-stream';
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = `events/${docId}/cover${getExtFromContentType(contentType)}`;
      const file = bucket.file(filePath);

      await file.save(buffer, { metadata: { contentType } });
      try {
        await file.makePublic();
      } catch (e) {
        console.warn('Could not make file public:', e.message);
      }

      const encodedPath = encodeURIComponent(filePath);
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media`;
      console.log(`Uploaded cover for ${docId} to ${publicUrl}`);
      return publicUrl;
    } catch (e) {
      console.warn(`Failed to rehost cover image for ${docId}:`, e.message);
      return undefined;
    }
  }

  try {
    const head = await fetch(coverSource, { method: 'HEAD' });
    if (!head.ok) {
      console.warn(`Facebook CDN cover URL for ${docId} returned ${head.status}; skipping`);
      return undefined;
    }
    return coverSource;
  } catch (e) {
    console.warn(`Error checking FB cover URL for ${docId}:`, e.message);
    return undefined;
  }
}

module.exports = { rehostCoverOrValidate };