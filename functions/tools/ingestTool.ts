import { ingestEvents } from '../src/handlers/ingestEventsHandler';
import { buildDeps } from './deps';

async function main() {
  console.log('Running manual ingest tool...');
  const deps = buildDeps();
  const result = await ingestEvents(deps);
  console.log('Ingest finished:', result);
}

main().catch((error) => {
  console.error('Ingest tool failed:', error?.message || error);
  process.exitCode = 1;
});