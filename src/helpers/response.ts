import { expect } from '@playwright/test';
import { TypedResponse } from '@api/dln/ordersApi';

/**
 * Asserts the response status (200 by default) and returns the typed JSON body.
 * Accepts the response or its promise. On a mismatch the failure message carries the URL and the raw body.
 */
export async function bodyOf<T>(
  pending: TypedResponse<T> | Promise<TypedResponse<T>>,
  status = 200,
): Promise<T> {
  const response = await pending;
  expect(response.status(), `${response.url()} → ${await response.text()}`).toBe(status);
  return response.json();
}
