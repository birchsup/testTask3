import { test, expect } from '@fixtures/api-fixture';
import { bodyOf } from '@helpers/response';
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, TARGET_WALLET } from '@testData/constants';

const statsValue = expect.objectContaining({ stringValue: expect.any(String) });

/** Contract of GET /api/Orders/{orderId}: what the UI loads when a row is clicked. */
test.describe('GET /api/Orders/{orderId}', () => {
  test('returns details of the requested order with address fields', async ({ ordersApi }) => {
    const { orders } = await bodyOf(
      ordersApi.getPage({ pageNumber: FIRST_PAGE, take: DEFAULT_PAGE_SIZE, filter: TARGET_WALLET }),
    );
    expect(
      orders,
      `precondition: filtered list for ${TARGET_WALLET} must contain at least one order to look up`,
    ).not.toEqual([]);
    const orderId = orders[0].orderId.stringValue;

    const details = await bodyOf(await ordersApi.getOrderDetails(orderId));

    expect(details).toEqual(
      expect.objectContaining({
        orderId: expect.objectContaining({ stringValue: orderId }),
        state: expect.any(String),
        makerSrc: statsValue,
        receiverDst: statsValue,
      }),
    );
  });
});
