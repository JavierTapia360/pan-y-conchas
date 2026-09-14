# Commerce boundary

`CATALOG_PRODUCTS` (Flower and Wax) are visual/informational only. They cannot create cart items, checkout sessions, orders, shipping labels or transactional handoffs.

`MERCH_PRODUCTS` are conventional goods with a separate type, table, inventory and cart. The server resolves every merch item from its own authority, ignores browser-submitted prices, checks active inventory and rejects unknown or regulated product types.

Payment adapters exist only for merch. Provider webhooks—not return-page query parameters—will become the authority for payment status and atomic inventory decrement. Card numbers are never stored. No live provider is enabled until real inventory, rates, sandbox verification and approved credentials exist.
