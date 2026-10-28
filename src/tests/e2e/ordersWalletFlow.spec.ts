import { test, expect } from '@fixtures/api-fixture';
import { findAddressPaths } from '@helpers/jsonSearch';
import { bodyOf } from '@helpers/response';
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, TARGET_WALLET } from '@testData/constants';

/**
 * List items do not carry the wallet, so "the filter returned the right orders"
 * can only be verified through details: the wallet must be present in at least
 * one field of every filtered order.
 */
test(`every order filtered by ${TARGET_WALLET} references the wallet in its details`, async ({
  ordersApi,
}) => {
  const { orders } = await bodyOf(
    ordersApi.getPage({ pageNumber: FIRST_PAGE, take: DEFAULT_PAGE_SIZE, filter: TARGET_WALLET }),
  );

  expect(orders, `precondition: no orders found for ${TARGET_WALLET}`).not.toEqual([]);

  const walletPathsByOrder: Record<string, string[]> = {};

  for (const order of orders) {
    const orderId = order.orderId.stringValue;
    const details = await bodyOf(ordersApi.getOrderDetails(orderId));

    expect.soft(details.orderId.stringValue, `details of ${orderId}`).toBe(orderId);
    walletPathsByOrder[orderId] = findAddressPaths(details, TARGET_WALLET);
  }

  const ordersWithoutWallet = Object.keys(walletPathsByOrder).filter(
    (orderId) => walletPathsByOrder[orderId].length === 0,
  );

  expect(
    ordersWithoutWallet,
    `filtered list returned orders whose details never mention ${TARGET_WALLET}`,
  ).toEqual([]);
});
