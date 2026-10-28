import { APIRequestContext, request as requestFactory, test as base } from '@playwright/test';
import { OrdersApi } from '@api/dln/ordersApi';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Playwright requires the `{}` literal to denote "no test-scoped fixtures"
type TestFixtures = {};

type WorkerFixtures = {
  apiContext: APIRequestContext;
  ordersApi: OrdersApi;
};

/** Worker-scoped API context: one HTTP session per worker, reused across specs. */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  apiContext: [
    // eslint-disable-next-line no-empty-pattern -- worker fixture has no deps
    async ({}, use, workerInfo) => {
      // baseURL and headers come from `use` in playwright.config.api.ts (API_BASE_URL via .env.<TEST_ENV>).
      const { baseURL, extraHTTPHeaders } = workerInfo.project.use;
      const context = await requestFactory.newContext({
        baseURL,
        extraHTTPHeaders,
        // Observed latency is 0.3–0.7 s per call; 5 s is a hung request, not a slow one.
        timeout: 5_000,
      });

      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  ordersApi: [
    async ({ apiContext }, use) => {
      await use(new OrdersApi(apiContext));
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
