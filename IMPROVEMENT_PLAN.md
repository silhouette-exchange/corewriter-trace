# CoreWriter Trace - Improvement Plan (Updated)

## 1. Introduction

The goal is to evolve the CoreWriter Trace tool from a transaction-specific decoder into a more fully-fledged block explorer for the Hyperliquid ecosystem. This plan outlines the proposed new features and improvements, keeping in mind the unique dual-chain architecture (HyperEVM and HyperCore).

The core principle is to enhance functionality while maintaining the existing design and user experience, with a primary focus on introducing account-centric exploration capabilities.

## 2. Guiding Principles

- **Dual-Chain First:** Every new feature must consider both HyperEVM (L2) and HyperCore (L1). Account views, in particular, should present a unified summary across both chains.
- **Maintain Simplicity:** The UI should remain clean and intuitive. New features should be integrated in a way that doesn't clutter the existing interface.
- **Component-Based:** New features should be built as modular React components to ensure maintainability and reusability.
- **Inspired by Standards:** We will draw inspiration from established explorers like Blockscout for data presentation and feature sets, but adapt them specifically for Hyperliquid's architecture.

## 3. High-Level Feature Proposals

### 3.1. Unified Search & Navigation

The current tabbed input fields on the homepage will be replaced by a single, intelligent search bar.

- **Smart Input Detection:** The search bar will automatically detect the input type:
  - Transaction Hash (HyperEVM or HyperCore)
  - Account Address
- **Routing:** Based on the input type, the user will be navigated to the appropriate page (Transaction View or the new Account View).
- **Note on TX Hashes:** For a given transaction hash, only one of the HyperEVM or HyperCore APIs will return a result. The search logic should query both and route to the one that responds successfully.

### 3.2. Account Details Page (High Priority)

This is the core new feature. A new page will be created that provides a comprehensive overview of a specific user account. The page will feature a two-pane layout to present information from both chains side-by-side.

**URL Structure:** `/address/{account_address}`

**Layout:**

- **Left Pane: HyperEVM (L2)**
  - **Balance:** Display the account's **HYPE** balance.
  - **Transaction History:** A paginated list of all HyperEVM transactions involving this account. Transactions containing CoreWriter actions will be visually indicated, similar to the current explorer. Each transaction will link to its respective transaction detail page.
- **Right Pane: HyperCore (L1)**
  - **Account State:** Display the user's current state on the L1, including:
    - Spot Balances
    - Perpetual Positions & Margin Summary
    - Withdrawable funds
    - (This will reuse and expand upon the existing `AccountBalanceModal` component).
  - **Transaction History:** A paginated list of the user's L1 actions (e.g., deposits, withdrawals, liquidations, etc.). Each transaction will link to its HyperCore transaction detail page.

### 3.3. Enhanced Transaction Views

The existing transaction detail pages will be updated to improve interconnectivity within the explorer.

- **Clickable Addresses:** All addresses displayed on the HyperEVM and HyperCore transaction views (e.g., 'From', 'To', 'User') will be converted into links that navigate to the new Account Details Page for that address.

## 4. Implementation Notes

- **Prioritization:** The **Account Details Page** is the highest priority and will be detailed first.
- **Data Fetching (HyperEVM):** The method for fetching an account's transaction history on HyperEVM is not yet defined. The AI implementing this feature will need to research available RPC methods or indexing services.
- **Data Fetching (HyperCore):** The `@nktkas/hyperliquid` library will be used to fetch the L1 action history for an account.
- **Pagination:** Transaction history lists will use a "Load More" button, showing 25 items per page.
- **UI/Display:** No specific UI preferences have been stated. The implementation will follow the existing design language and conventions from standard block explorers.
- **Block Details Page:** This feature is out of scope for now and will be considered in the future.
