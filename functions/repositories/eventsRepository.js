function dropUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

function createEventsRepository(admin) {
  const db = admin.firestore();
  const col = db.collection('events');

  const upsertMany = async (pageId, events) => {
    const nowIso = new Date().toISOString();
    const batch = db.batch();
    for (const ev of events) {
      const ref = col.doc(ev.id);
      batch.set(ref, dropUndefined({
        id: ev.id,
        pageId,
        title: ev.name,
        description: ev.description,
        startTime: ev.start_time,
        endTime: ev.end_time,
        place: ev.place,
        coverImageUrl: ev.cover?.source,
        eventURL: `https://facebook.com/events/${ev.id}`,
        updatedAt: nowIso
      }), { merge: true });
    }
    await batch.commit();
    return { upserted: events.length };
  };

  return { upsertMany };
}

module.exports = { createEventsRepository };