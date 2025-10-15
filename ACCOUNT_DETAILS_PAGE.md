# Feature Specification: Account Details Page

## 1. Objective

To create a new, comprehensive "Account Details" page that provides a unified view of a user's assets and transaction history across both HyperEVM (L2) and HyperCore (L1). This page will serve as the central hub for account-centric exploration.

## 2. URL Structure

The page will use Next.js dynamic routing to handle different account addresses.

- **URL:** `/address/[address]`
- **Example:** `/address/0x1234...abcd`

## 3. Page Layout & Component Structure

The page will be composed of a main page component that orchestrates several smaller, specialized components. The primary layout will be a two-pane design, displaying HyperEVM and HyperCore information side-by-side.

### 3.1. Main Page Component

- **File:** `app/address/[address]/page.tsx`
- **Responsibilities:**
  - Extracts the `address` from the URL parameters.
  - Renders the main page layout, including the account address as a title.
  - Renders the `HyperEvmAccountDetails` and `HyperCoreAccountDetails` components, passing the address to each.

### 3.2. Left Pane: HyperEVM (L2)

- **Component:** `app/components/AccountDetails/HyperEvmAccountDetails.tsx`
- **Responsibilities:**
  - Displays a title, e.g., "HyperEVM (L2) Overview".
  - Fetches and displays the account's **HYPE** balance using `ethers.js`.
  - Renders the `HyperEvmTransactionList` component.

#### 3.2.1. HyperEVM Transaction List

- **Component:** `app/components/AccountDetails/HyperEvmTransactionList.tsx`
- **Functionality:**
  - **Data Fetching:**
    - **Instruction for AI:** The method for fetching a transaction list by address on HyperEVM is not predefined. You must research the capabilities of the public RPC endpoints. If a direct method like `eth_getTransactionsByAddress` is not available, investigate if Hyperliquid provides a public, Etherscan-compatible API for this purpose. If no direct method is found, this feature may need to be deferred.
  - **Display:**
    - Renders a table or list of transactions.
    - Each row should display:
      - **Transaction Hash:** Link to the transaction's detail page.
      - **Method:** The function name/signature if it's a contract interaction (e.g., "Transfer"), otherwise empty.
      - **Block Number:** Link to the (future) block detail page.
      - **Age:** A human-readable timestamp (e.g., "5 minutes ago").
      - **CoreWriter Indicator:** A small badge or icon if the transaction includes `RawAction` logs from the CoreWriter contract.
  - **Pagination:**
    - Initially, fetch and display 25 transactions.
    - A "Load More" button at the bottom of the list will fetch and append the next 25 transactions.

### 3.3. Right Pane: HyperCore (L1)

- **Component:** `app/components/AccountDetails/HyperCoreAccountDetails.tsx`
- **Responsibilities:**
  - Displays a title, e.g., "HyperCore (L1) State".
  - Renders the `HyperCoreAccountState` component.
  - Renders the `HyperCoreTransactionList` component.

#### 3.3.1. HyperCore Account State

- **Component:** `app/components/AccountDetails/HyperCoreAccountState.tsx`
- **Functionality:**
  - This component will be a refactored, non-modal version of the existing `AccountBalanceModal.tsx`.
  - It will accept an `address` prop.
  - Using the `@nktkas/hyperliquid` library, it will fetch and display:
    - A summary section (Account Value, Total Margin Used, Withdrawable).
    - A list of open Perpetual Positions.
    - A table of Spot Balances.

#### 3.3.2. HyperCore Transaction List

- **Component:** `app/components/AccountDetails/HyperCoreTransactionList.tsx`
- **Functionality:**
  - **Data Fetching:**
    - Use the `@nktkas/hyperliquid` library's `InfoClient` to fetch the user's L1 action history.
  - **Display:**
    - Renders a table or list of L1 actions.
    - Each row should display:
      - **Transaction Hash:** Link to the transaction's detail page.
      - **Action Type:** The type of L1 action (e.g., "deposit", "withdrawal", "order").
      - **Timestamp:** A human-readable timestamp.
  - **Pagination:**
    - Follows the same "Load More" pattern as the HyperEVM list, with 25 items per page.

## 4. Implementation Steps

1.  **Create New Directory:** Create a new directory `app/components/AccountDetails`.
2.  **Refactor `AccountBalanceModal`:**
    - Create the new `HyperCoreAccountState.tsx` component.
    - Move the core data fetching and display logic from `AccountBalanceModal.tsx` into this new component.
    - The modal can now be a simpler wrapper around this new component.
3.  **Build Page Structure:**
    - Create the dynamic route page at `app/address/[address]/page.tsx`.
    - Create the main pane components: `HyperEvmAccountDetails.tsx` and `HyperCoreAccountDetails.tsx`.
4.  **Implement Transaction Lists:**
    - Create `HyperEvmTransactionList.tsx` and `HyperCoreTransactionList.tsx`.
    - Implement the data fetching and pagination logic for both.
5.  **Update Existing Components:**
    - Modify `TransactionInfo.tsx` and `HyperCoreTransactionInfo.tsx`.
    - Identify all displayed addresses ('From', 'To', 'User') and transform them into Next.js `<Link>` components pointing to the new account details page (e.g., `<Link href={`/address/${address}`}>`).
6.  **Implement Unified Search:**
    - On `app/page.tsx`, replace the tabbed interface with a single search input and button.
    - The search handler function will:
      1.  Check if the input is a valid address or a transaction hash.
      2.  If it's an address, navigate to `/address/[address]`.
      3.  If it's a transaction hash, attempt to fetch it from both the HyperEVM provider and the HyperCore API. Route the user to the main page with the correct chain type and hash set in the state based on which API call succeeds.
