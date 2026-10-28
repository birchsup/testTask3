import { APIRequestContext, APIResponse } from '@playwright/test';
import { FilteredListResponse, OrderDetails } from './types';

/**
 * Raw Playwright response tagged with the type of its JSON body on success.
 * The tag is never set at runtime; it only lets `bodyOf()` infer the type.
 */
export type TypedResponse<T> = APIResponse & { readonly __body?: T };

export type PageRequest = {
  /** 1-based. */
  pageNumber: number;
  /** Rows per page; tests that assert on row count should pass it explicitly. */
  take: number;
  /** Wallet address or tx hash typed into the search box. Omit for the unfiltered feed. */
  filter?: string;
};

/**
 * Transport only: methods return the raw response and make no assumptions
 * about its status, so tests can assert both success and error bodies.
 *
 * - list:    POST /api/Orders/filteredList  (what the orders table calls, incl. the search box)
 * - details: GET  /api/Orders/{orderId}     (what the UI calls when a row is clicked)
 */
export class OrdersApi {
  constructor(private readonly request: APIRequestContext) {}

  async getPage({
    pageNumber,
    take,
    filter,
  }: PageRequest): Promise<TypedResponse<FilteredListResponse>> {
    return this.request.post('/api/Orders/filteredList', {
      data: {
        giveChainIds: [],
        takeChainIds: [],
        filter,
        skip: (pageNumber - 1) * take,
        take,
        filterMode: 'Mixed',
      },
    });
  }

  async getOrderDetails(orderId: string): Promise<TypedResponse<OrderDetails>> {
    return this.request.get(`/api/Orders/${orderId}`);
  }
}
