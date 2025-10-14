# Feature Specification: Unified Search & Navigation

## 1. Objective

To replace the current, tabbed search interface on the homepage (`app/page.tsx`) with a single, intelligent search bar. This new component will automatically detect the type of user input (transaction hash or account address) and navigate the user to the appropriate page.

## 2. Component Location & Structure

*   **Primary File to Modify:** `app/page.tsx`
*   **New Component (Optional but Recommended):** `app/components/UnifiedSearchBar.tsx`
    *   It is recommended to encapsulate the search logic into a dedicated component for better separation of concerns. The main page component will then just render this search bar.

## 3. Functional Requirements

### 3.1. UI Changes on Homepage

*   Remove the existing tab switcher (`<div className="tab-switcher">...</div>`).
*   Remove the separate input fields and network selectors for HyperEVM and HyperCore.
*   In their place, add a single search input field and a "Search" button.
*   The network selection (Mainnet/Testnet/Custom) should remain, but it should be a single dropdown that applies globally to the search context. When a search is initiated, this network setting will be used for the API calls.

### 3.2. Input Detection Logic

The core of this feature is the logic that runs when the user clicks "Search". This logic must be robust enough to handle different input types.

*   **Input Validation:**
    1.  Trim whitespace from the input string.
    2.  Check if the input is a valid Ethereum-style address (starts with `0x`, is 42 characters long, and contains hexadecimal characters).
    3.  Check if the input is a valid transaction hash (starts with `0x`, is 66 characters long, and contains hexadecimal characters).

*   **Routing Logic:**
    *   **If the input is an address:**
        *   Use Next.js's `useRouter` to programmatically navigate the user to the Account Details Page.
        *   **Example:** `router.push(`/address/${searchInput}`);`
    *   **If the input is a transaction hash:**
        *   This is the more complex case due to the dual-chain architecture. The application must determine whether the hash belongs to HyperEVM or HyperCore.
        *   **Execution Flow:**
            1.  Trigger a loading state in the UI.
            2.  Initiate **two parallel API calls**:
                *   One call to the HyperEVM provider (`provider.getTransactionReceipt(searchInput)`).
                *   One call to the HyperCore API (`client.txDetails({ hash: searchInput })`).
            3.  Use `Promise.race` or a similar mechanism to see which call returns a valid result first.
            4.  **If the HyperEVM call succeeds:**
                *   The application should stay on the homepage (`/`) but update its state to display the HyperEVM transaction details, just as it does today. The `chainType` state should be set to `hyperevm`.
            5.  **If the HyperCore call succeeds:**
                *   The application should stay on the homepage (`/`) but update its state to display the HyperCore transaction details. The `chainType` state should be set to `hypercore`.
            6.  **If both calls fail:**
                *   Display an error message to the user, e.g., "Transaction hash not found on either HyperEVM or HyperCore."
    *   **If the input is neither an address nor a hash:**
        *   Display an error message, e.g., "Invalid input. Please enter a valid transaction hash or account address."

## 4. State Management

The main page component (`app/page.tsx`) will need to manage the following state:

*   `searchInput`: The current value in the search input field.
*   `network`: The currently selected network ('mainnet', 'testnet', 'custom').
*   `customRpc`: The URL for the custom RPC endpoint.
*   `loading`: A boolean to indicate when a search is in progress.
*   `error`: A string to hold any error messages.
*   The existing state variables for holding transaction results (`hyperEvmTransaction`, `hyperCoreTx`, etc.) will be reused.

## 5. Implementation Steps

1.  **(Optional) Create `UnifiedSearchBar.tsx`:**
    *   Build the UI with a single `input` and `button`.
    *   Pass down the necessary state and event handlers from the parent (`value`, `onChange`, `onSearch`).
2.  **Modify `app/page.tsx`:**
    *   Remove the old tabbed UI elements.
    *   Add the new `UnifiedSearchBar` component (or the raw input/button).
    *   Keep a single network selector.
3.  **Implement the Search Handler Function:**
    *   Create an `async function handleSearch(input: string)` that contains the input validation and routing logic described in section 3.2.
    *   This function will be called when the search button is clicked.
4.  **Update State Management:**
    *   Consolidate the separate `hyperEvmTxHash` and `hyperCoreTxHash` state variables into a single `searchInput`.
    *   Consolidate the network state variables similarly.
5.  **Error Handling:**
    *   Ensure that loading and error states are handled gracefully, providing clear feedback to the user.
