function createPagesRepository(admin) {
  const db = admin.firestore();
  const col = db.collection('pages');

  const upsert = (page) => col.doc(page.id).set(page, { merge: true });
  const listActive = async () => (await col.where('active', '==', true).get()).docs.map(d => ({ id: d.id, ...d.data() }));

  return { upsert, listActive };
}

async function getAllPageIds(db) {
  const snapshot = await db.collection('pages').get();
  const ids = [];
  snapshot.forEach((doc) => ids.push(doc.id));
  return ids;
}

module.exports = { createPagesRepository, getAllPageIds };