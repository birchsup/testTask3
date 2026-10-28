/** Scalar wrapper used by stats-api for ids, addresses and amounts. */
export type StatsValue = {
  stringValue: string;
  bytesValue?: string;
  bytesArrayValue?: string;
  bigIntegerValue?: number;
};

/** Give/take side of an order as returned by the list endpoint. */
export type OfferWithMetadata = {
  chainId: StatsValue;
  tokenAddress?: StatsValue;
  [key: string]: unknown;
};

export type OrderListItem = {
  orderId: StatsValue;
  creationTimestamp: number;
  state: string;
  externalCallState: string;
  giveOfferWithMetadata: OfferWithMetadata;
  takeOfferWithMetadata: OfferWithMetadata;
  createEventTransactionHash?: StatsValue;
  [key: string]: unknown;
};

export type FilteredListResponse = {
  orders: OrderListItem[];
  totalCount: number;
};

/**
 * Order details (`GET /api/Orders/{orderId}`).
 * Only the address-bearing fields are typed explicitly; the wallet under test
 * may show up in any of them (and in nested event metadata), so the test
 * searches the whole payload rather than relying on this list.
 */
export type OrderDetails = {
  orderId: StatsValue;
  state: string;
  makerSrc?: StatsValue;
  receiverDst?: StatsValue;
  givePatchAuthoritySrc?: StatsValue;
  orderAuthorityAddressDst?: StatsValue;
  allowedTakerDst?: StatsValue | null;
  allowedCancelBeneficiarySrc?: StatsValue | null;
  unlockBeneficiarySrc?: StatsValue | null;
  cancelBeneficiarySrc?: StatsValue | null;
  taker?: StatsValue | null;
  unlockAuthorityDst?: StatsValue | null;
  createdSrcEventMetadata?: { initiator?: StatsValue; [key: string]: unknown } | null;
  [key: string]: unknown;
};
