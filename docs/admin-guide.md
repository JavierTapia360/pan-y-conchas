# Local Admin guide

Open `/admin`. There is no login because there is no server or shared database in this phase.

The top notice explains that all changes are stored only in the current browser. Product editing supports name, bilingual descriptions, Featured/Hidden, prices and integer stock per presentation, gallery order, main image, mobile image and the product's official video.

Choose **Edit**, make changes, then choose **Save changes**. Save success appears only after `localStorage` accepts the write. Cancel discards the draft. A stock value of zero marks only that presentation sold out; the product becomes generally sold out when all three presentations reach zero.

Messages and consented metrics are local views of browser-only data. **View site** opens the same storefront data in a new tab on the same device.

Clearing site data resets the local edits to the defaults in `data/products.ts`.
