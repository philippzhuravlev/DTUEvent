import { handleRefreshTokens } from '../src/handlers/tokenRefreshHandler';
import { buildDeps } from './deps';

async function main() {
  console.log('Running manual token refresh tool...');
  const deps = buildDeps();
  await handleRefreshTokens(deps);
  console.log('Token refresh finished.');
}

main().catch((error) => {
  console.error('Refresh tool failed:', error?.message || error);
  process.exitCode = 1;
});