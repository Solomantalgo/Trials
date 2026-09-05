# Trial Salon Demo — Option 2

Modern, energetic Standard-tier concept for the same fictional salon as Option 1. Run `npm run dev` and open http://localhost:5174. No dependencies or compilation are required; the directory can be hosted as a static website. `npm run build` checks JavaScript syntax.

`data.js` centralizes salon details, categories, prices, services, testimonials, contacts and original image references. All supplied photographs are copied without renaming into `assets/images/`. The source image directory was empty, so originals came from the Option 1 project root.

The service-first booking route preselects a service and starts at the preferred date. General booking includes a category and service picker. Requests have date/time selection, native validation, editable review, explicit demo confirmation, text download and optional WhatsApp sharing. No data is persisted, no appointments are reserved, and nothing is transmitted to a salon. Real contact details and a delivery endpoint would be needed before launching for a real business.

The gallery supports horizontal scrolling, keyboard controls, touch, previous/next buttons and an accessible native dialog. Animations respect reduced-motion preferences. Mobile booking access is hidden during the dedicated booking flow.
