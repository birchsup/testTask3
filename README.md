# testTask3 — deBridge Orders API autotests (Playwright)

API-level tests for the backend behind <https://app.debridge.com/orders>
(`https://stats-api.dln.trade`). No browser is launched.
The URL from the task, `app.debridge.finance/orders`, redirects to the `.com` host.

## Test layers

- **contract** — live endpoints respond with the shape the UI relies on.
- **e2e** — one end-to-end test of the task scenario below.

## Scenario

1. **Orders list** — `POST /api/Orders/filteredList`, paginated with `take: 25` / `skip: N*25`.
2. **Wallet filter** — same endpoint with `filter: <wallet>` and `filterMode: "Mixed"`
   (the search box on the page). Only orders of
   `BUnGokFzA1wu8vb6adHfyhnNvCxaVt6QyPNmmUNWPwET` are processed.
3. **Order details** — for every order on the first filtered page (25 items),
   `GET /api/Orders/{orderId}` (the request fired when a row is clicked in the UI).
4. **Wallet validation** — the details payload is searched recursively; the wallet must appear
   in at least one string field. Observed locations differ per order:
   - sender side: `makerSrc`, `givePatchAuthoritySrc`, `allowedCancelBeneficiarySrc`,
     `createdSrcEventMetadata.initiator`
   - receiver side: `receiverDst`, `orderAuthorityAddressDst`

   The list items themselves do **not** contain the wallet, so validation is only possible via details.

Pagination is covered separately in `contract/pagination.spec.ts`: page 1 (`skip: 0`) and page 2
(`skip: 25`) are both full, share the same `totalCount` and do not repeat orders.
Requests are made one by one: the backend sits behind Cloudflare and answers 429 to parallel bursts.

The request bodies were captured from the live UI (browser network tab) when the suite was written;
the tests do not re-check the UI itself.

## Setup

```bash
npm install
```

Environment files are picked by `TEST_ENV` (default `prod`): `.env.prod` is committed and points at
`stats-api.dln.trade`. To target another backend, add `.env.<name>` (git-ignored) and run with
`TEST_ENV=<name>`.

## Run

```bash
npm test               # both projects, a few seconds
npm run test:contract  # live endpoint shapes
npm run test:e2e       # the task scenario end to end
npm run check          # tsc + eslint + prettier (same as pre-push)
npm run report         # HTML report
```

| Env            | Default          | Meaning                                        |
| -------------- | ---------------- | ---------------------------------------------- |
| `TEST_ENV`     | `prod`           | Which `.env.<name>` to load; shown in metadata |
| `API_BASE_URL` | from `.env.prod` | Backend host, required (`use.baseURL`)         |
| `PW_WORKERS`   | `5`              | Playwright workers                             |
| `PW_BLOB`      | unset            | Set to switch the reporter to `blob`           |

## Structure

```
src/
  api/
    dln/ordersApi.ts      # getPage / getOrderDetails: transport only, return raw responses
    dln/types.ts          # response types
  fixtures/api-fixture.ts # worker-scoped `ordersApi` over config `use.baseURL`
  helpers/
    jsonSearch.ts         # findAddressPaths — recursive wallet lookup
    response.ts           # bodyOf — asserts status, returns typed JSON body
  testData/constants.ts   # TARGET_WALLET, UNKNOWN_WALLET, INVALID_FILTER, FIRST_PAGE
  tests/
    contract/filteredList.spec.ts     # POST /api/Orders/filteredList shape
    contract/pagination.spec.ts       # page 1 / page 2: skip, take, totalCount, no repeats
    contract/orderDetails.spec.ts     # GET /api/Orders/{orderId} shape
    e2e/ordersWalletFlow.spec.ts      # page → details → wallet validation
scripts/git-hooks/pre-push-check.sh   # no .only, tsc, eslint, prettier
.github/workflows/ci.yml              # npm ci → check → test, report uploaded as artifact
.env.prod                             # TEST_ENV=prod, API_BASE_URL
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes to `main` and on pull requests:
`npm ci`, `npm run check`, `npm test`. The suite is API-only, so no browsers are installed.
The HTML report is uploaded as the `playwright-report-api` artifact on every run.

## Scripts

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm test`              | All projects (`playwright.config.api.ts`)   |
| `npm run test:contract` | Live endpoint contract tests                |
| `npm run test:e2e`      | Live end-to-end flow                        |
| `npm run check`         | `checkError` + `lint` + `format:check`      |
| `npm run report`        | Open HTML report (`playwright-report-api/`) |
| `npm run lint`          | ESLint over `**/*.{ts,js,mjs}`              |
| `npm run lint:fix`      | ESLint with autofix                         |
| `npm run format`        | Prettier write                              |
| `npm run format:check`  | Prettier check                              |
| `npm run checkError`    | `tsc --noEmit`                              |
