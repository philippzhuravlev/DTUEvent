function getExtFromContentType(contentType) {
  if (!contentType) return '';
  const c = contentType.toLowerCase();
  if (c.includes('jpeg') || c.includes('jpg')) return '.jpg';
  if (c.includes('png')) return '.png';
  if (c.includes('gif')) return '.gif';
  if (c.includes('webp')) return '.webp';
  return '';
}

module.exports = { getExtFromContentType };