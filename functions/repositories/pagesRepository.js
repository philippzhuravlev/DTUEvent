function createPagesRepository(admin) {
  const db = admin.firestore();
  const col = db.collection('pages');

  const upsert = (page) => col.doc(page.id).set(page, { merge: true });
  const listActive = async () => (await col.where('active', '==', true).get()).docs.map(d => ({ id: d.id, ...d.data() }));

  return { upsert, listActive };
}

module.exports = { createPagesRepository };