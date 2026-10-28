import { test, expect } from '@fixtures/api-fixture';
import { bodyOf } from '@helpers/response';
import {
  DEFAULT_PAGE_SIZE,
  FIRST_PAGE,
  INVALID_FILTER,
  TARGET_WALLET,
  UNKNOWN_WALLET,
} from '@testData/constants';

const statsValue = expect.objectContaining({ stringValue: expect.any(String) });
const take = DEFAULT_PAGE_SIZE;
const pageNumber = FIRST_PAGE;

/** Contract of POST /api/Orders/filteredList: the list the orders table renders. */
test.describe('POST /api/Orders/filteredList', () => {
  test('unfiltered page holds as many orders as requested, with ids and chain ids', async ({
    ordersApi,
  }) => {
    const page = await bodyOf(await ordersApi.getPage({ pageNumber, take }));

    expect(page.totalCount).toBeGreaterThan(take);
    expect(page.orders).toHaveLength(take);
    for (const order of page.orders) {
      expect(order).toEqual(
        expect.objectContaining({
          orderId: statsValue,
          state: expect.any(String),
          giveOfferWithMetadata: expect.objectContaining({ chainId: statsValue }),
          takeOfferWithMetadata: expect.objectContaining({ chainId: statsValue }),
        }),
      );
    }
  });

  // Only the page/total shape is checked here: list items do not carry the wallet,
  // so whether the right orders came back is verified in e2e/ordersWalletFlow.spec.ts.
  test('filter reduces totalCount and still returns a page', async ({ ordersApi }) => {
    const [filtered, unfiltered] = await Promise.all([
      ordersApi
        .getPage({ pageNumber, take, filter: TARGET_WALLET })
        .then((response) => bodyOf(response)),
      ordersApi.getPage({ pageNumber, take }).then((response) => bodyOf(response)),
    ]);

    expect(filtered.orders.length).toBeGreaterThan(0);
    expect(filtered.orders.length).toBeLessThanOrEqual(take);
    expect(filtered.totalCount).toBeGreaterThan(0);
    expect(filtered.totalCount).toBeLessThan(unfiltered.totalCount);
  });

  test('well-formed address that owns no orders yields an empty page, not an error', async ({
    ordersApi,
  }) => {
    expect(UNKNOWN_WALLET).not.toBe(TARGET_WALLET);

    const page = await bodyOf(
      await ordersApi.getPage({ pageNumber, take: DEFAULT_PAGE_SIZE, filter: UNKNOWN_WALLET }),
    );

    expect(page).toEqual({ orders: [], totalCount: 0 });
  });

  test('filter that is neither hex nor base58 is rejected with 400 and an error body', async ({
    ordersApi,
  }) => {
    const response = await ordersApi.getPage({
      pageNumber,
      take: DEFAULT_PAGE_SIZE,
      filter: INVALID_FILTER,
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      message: `An invalid filter value was passed. Could not decode ${INVALID_FILTER}. Value must be either hex, or base58.`,
      errorCode: 400,
    });
  });
});
