# Commerce boundary

Flower products may be gathered in the browser-only `gf_cart_v1` cart by presentation. The experience supports quantities, current price, subtotal and stock limits, then ends at a visual order summary.

No checkout session, stored order, payment, shipping service or inventory reservation exists. Cart actions never decrement stock. The order-summary form remains browser-only; only after the visitor explicitly presses **Request order / Solicitar pedido** does the site open the official Telegram chat with a prefilled draft containing the cart and delivery details. Telegram still requires the visitor to review and send the message.

General Telegram links in the menu, contact page, footer and cart drawer do not attach cart or personal data.

The separate merch placeholder is also non-transactional in this phase.
