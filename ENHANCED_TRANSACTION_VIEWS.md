# Feature Specification: Enhanced Transaction Views

## 1. Objective

To improve the interconnectivity of the explorer by making all addresses displayed within the existing HyperEVM and HyperCore transaction detail views clickable. These links will navigate the user to the new "Account Details" page for the respective address.

## 2. Scope of Changes

This task involves modifying the following existing components to change how addresses are rendered:

*   `app/components/TransactionInfo/TransactionInfo.tsx` (for HyperEVM)
*   `app/components/HyperCoreTransactionInfo.tsx` (for HyperCore)

## 3. Functional Requirements

The core requirement is to replace static text displays of addresses with interactive links.

### 3.1. HyperEVM Transaction View (`TransactionInfo.tsx`)

*   **Target Fields:**
    *   `From`: The sender of the transaction.
    *   `To`: The recipient of the transaction or the contract address.
*   **Implementation Details:**
    *   Import the `Link` component from `next/link`.
    *   In the JSX, wrap the address values for the 'From' and 'To' fields in a `<Link>` component.
    *   The `href` attribute of the link should be dynamically generated.
    *   **Example:**
        ```jsx
        // Before
        <code>{transaction.from}</code>

        // After
        <Link href={`/address/${transaction.from}`} passHref>
          <code className="clickable-address">{transaction.from}</code>
        </Link>
        ```
    *   A new CSS class, `clickable-address`, should be added to provide visual feedback (e.g., pointer cursor, hover effect). This can be added to `globals.css`.

### 3.2. HyperCore Transaction View (`HyperCoreTransactionInfo.tsx`)

*   **Target Field:**
    *   `User`: The user who initiated the L1 action.
*   **Implementation Details:**
    *   The `User` field is already a `<button>` to open the balance modal. We will enhance this to also act as a navigation link.
    *   The best approach is to wrap the existing button in a `<Link>` component. This preserves the existing functionality while adding navigation.
    *   Import the `Link` component from `next/link`.
    *   Wrap the `<button>` element for the 'User' field.
    *   **Example:**
        ```jsx
        // Before
        <button
          type="button"
          className="info-value hash-value clickable-address"
          onClick={() => setShowBalanceModal(true)}
          // ...
        >
          {txDetails.user}
        </button>

        // After
        <Link href={`/address/${txDetails.user}`} passHref>
          <a className="info-value hash-value clickable-address" title="View account details">
            {txDetails.user}
          </a>
        </Link>
        {/* The modal can be triggered by a separate icon/button next to the address if needed,
            or we can reconsider the UX. For now, linking is the priority.
            A simple solution is to have the link navigate, and the modal can be accessed from the account page.
            Let's remove the onClick for the modal from this component to simplify.
            The Account Details page will now be the primary way to view balances.
        */}
        ```
    *   **Refinement:** To simplify the user experience, the `onClick` handler that opens the `AccountBalanceModal` should be **removed** from this component. The primary way to view an account's balance will now be by navigating to their Account Details page, which contains a more permanent and detailed view of their balances. The `AccountBalanceModal` can still be used elsewhere if needed, but its direct trigger from this component will be deprecated in favor of the new, more comprehensive page.

## 4. CSS Styling

Add the following styles to `app/globals.css` to ensure a consistent look and feel for all clickable links.

```css
.clickable-address {
  color: #3b82f6; /* Or your theme's link color */
  text-decoration: none;
  cursor: pointer;
  transition: text-decoration 0.2s ease-in-out;
}

.clickable-address:hover {
  text-decoration: underline;
}
```

## 5. Implementation Steps

1.  **Modify `TransactionInfo.tsx`:**
    *   Locate the `<tr>` elements for "From" and "To".
    *   Import `Link` from `next/link`.
    *   Wrap the address `<code>` tags with the `<Link>` component as described above.
2.  **Modify `HyperCoreTransactionInfo.tsx`:**
    *   Locate the `<button>` element for "User".
    *   Import `Link` from `next/link`.
    *   Replace the button with a `<Link>` component that wraps an `<a>` tag containing the user's address.
    *   Remove the `onClick` handler and the `showBalanceModal` state management from this component. The modal is no longer needed here.
3.  **Update CSS:**
    *   Add the `.clickable-address` styles to `app/globals.css`.
