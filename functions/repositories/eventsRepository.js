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

  async function upsertEventNormalized(db, Timestamp, docId, {
    id, pageId, title, description, startTime, endTime, place, coverImageUrl, eventURL, raw
  }) {
    const toTs = (iso) => (iso ? Timestamp.fromDate(new Date(iso)) : null);

    await db.collection('events').doc(docId).set({
      id,
      pageId,
      title,
      description,
      startTime: toTs(startTime),
      endTime: toTs(endTime),
      place,
      coverImageUrl,
      eventURL,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      raw,
    }, { merge: true });
  }

  return { upsertMany, upsertEventNormalized };
}

module.exports = { createEventsRepository };