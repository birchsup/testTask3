import { test, expect } from '@fixtures/api-fixture';
import { bodyOf } from '@helpers/response';
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, TARGET_WALLET } from '@testData/constants';

const take = DEFAULT_PAGE_SIZE;

/** Pagination of POST /api/Orders/filteredList: `skip = (page - 1) * take`, `totalCount` is the filter total. */
test.describe('POST /api/Orders/filteredList pagination', () => {
  test('page 2 holds the next 25 orders after page 1, totalCount unchanged', async ({
    ordersApi,
  }) => {
    const page1 = await test.step(`page 1: skip 0, take ${take}`, () =>
      bodyOf(ordersApi.getPage({ pageNumber: FIRST_PAGE, take, filter: TARGET_WALLET })));

    expect(page1.orders).toHaveLength(take);
    expect(page1.totalCount).toBeGreaterThan(take);

    const page2 = await test.step(`page 2: skip ${take}, take ${take}`, () =>
      bodyOf(ordersApi.getPage({ pageNumber: FIRST_PAGE + 1, take, filter: TARGET_WALLET })));

    expect(page2.orders).toHaveLength(take);
    expect(page2.totalCount).toBe(page1.totalCount);

    const page1Ids = page1.orders.map((order) => order.orderId.stringValue);
    const page2Ids = page2.orders.map((order) => order.orderId.stringValue);
    expect(
      page2Ids.filter((id) => page1Ids.includes(id)),
      'orders repeated from page 1',
    ).toEqual([]);
  });
});
