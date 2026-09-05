# Trial Salon Demo — Option 2

Modern, energetic Standard-tier concept for the same fictional salon as Option 1. Run `npm run dev` and open http://localhost:5174. No dependencies or compilation are required; the directory can be hosted as a static website. `npm run build` checks JavaScript syntax.

`data.js` centralizes salon details, categories, prices, services, testimonials, contacts and original image references. All supplied photographs are copied without renaming into `assets/images/`. The source image directory was empty, so originals came from the Option 1 project root.

The dedicated `#book` route now uses a single-page appointment builder. `#book?service=...` preselects a service; customers can change it directly, choose a preferred date/time, add relevant hair-length preferences and look notes, and enter contact details. The summary updates immediately, stays on the right on desktop, and uses a measured bottom dock on mobile with reserved page space. The action remains disabled until required details are valid. Submission changes the same builder into an inline completion state.

`appointment-builder.js` contains the request state and validation. `appointment-builder.css` scopes the new design to booking. `booking-pdf.js` creates selectable A4 PDFs using locally served, lazy-loaded jsPDF and Noto Sans assets in `assets/vendor/`; licenses are included. Requests receive a unique reference, and long PDF notes continue onto additional pages. Downloading makes no request to an external PDF service. `npm test` checks preselection, dates, preferred times, validation, look notes and PDF pagination.

Nothing is sent to a salon or reserved, no live availability is checked, and no payment is made. Details stay in the page session unless the customer explicitly downloads the PDF or chooses WhatsApp sharing.

The gallery supports horizontal scrolling, keyboard controls, touch, previous/next buttons and an accessible native dialog. Animations respect reduced-motion preferences.
