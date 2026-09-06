# Trial Salon Demo — Option 3 / Advanced

Run `npm run dev` and open http://localhost:5175. `npm run build` validates JavaScript syntax. `npm test` exercises scheduling, local persistence, clash prevention, timezone conversion and rescheduling rules. No dependencies or compilation are required.

## Functional difference

- Contextual service, category and professional booking routes.
- Nine progressive steps: category, service, professional, date, time, details, notes, review and payment; followed by a reference confirmation.
- Qualified-professional matching, weekly working days, synthetic commitments, 30-minute start intervals and duration-aware scheduling.
- Kampala timezone, future-only slots and a 60-day horizon.
- Structured browser-local appointment records, final clash recheck, same-browser tab notifications, reference retention on rescheduling, cancellation and record removal.
- Calendar export, JSON record download and user-directed WhatsApp sharing.

## Honest demonstration boundary

There is no backend in this project. Availability is simulated; no real appointment is reserved or sent to a salon. Records are stored in localStorage on this browser/device, not permanently or across devices. Storage failure falls back to page-session memory with an explicit notice. Visitors can cancel and remove local records. Mobile Money reference submission is simulated, with no real transaction, payment verification or customer account.

## Architecture

`data.js` centralizes business/contact information, the shared 16-service catalogue, prices, durations, four fictional professionals, imagery, testimonials and booking configuration. `booking-core.js` holds pure scheduling rules, record construction, validation, calendar formatting and the repository adapter. `app.js` renders reusable views and wires interaction. `styles.css` provides distinct mobile and desktop layouts and reduced-motion support.

Appointment records include schema version, ID, reference, status, source, created/updated timestamps, timezone, service snapshot, professional snapshot, date, start/end times, customer and notes. A real integration should replace the browser repository with server-side storage, authoritative availability and atomic conflict validation. The browser simulation is not a concurrency-safe production booking backend.

All ten supplied photographs are copied with original filenames into `assets/images/`. The supplied Option 1 image directory was empty; its original photographs were in the project root. Staff profiles use the existing supplied staff portraits. Contact links show the Kololo neighbourhood or allow user-selected WhatsApp sharing; no real business contact is invented.

## Manual Mobile Money demonstration

`DATA.demoPaymentConfig` in `data.js` contains the provider, synthetic merchant ID (`DEMO12345`) and deposit percentage (30 by default). Deposits are rounded to the nearest UGX from the selected service price. The launcher is deliberately an on-page simulation with no `tel:` action; changing public configuration cannot activate payments. A real implementation would need a separately supplied, provider-approved launcher. Never put a PIN or credentials in this configuration.

Review leads to Payment without creating a booking reference. Customers select deposit/full payment and submit a transaction reference and payment phone. The existing booking object stores the choice, service total, amount, balance, provider, reference, phone, submission timestamp and `paymentStatus: submitted`. Scheduling status remains `demo-scheduled` to preserve clash detection. `BookingCore.paymentStatuses` describes future payment lifecycle states; this demo never promotes a submission to confirmed or verified.

Rescheduling preserves the original payment snapshot and timestamp. Service/price changes are flagged for salon review, retaining the original balance instead of inventing a settlement. Cancellation retains payment history and does not refund anything. Legacy appointments without payment fields remain readable; rescheduling them includes the payment step.

Confirmation and visit details show awaiting-verification status. JSON downloads include payment information and the demonstration disclaimer, but omit customer contact details, payment phone and notes. WhatsApp shares also omit those personal fields. Drafts remain page-session state, as before: refreshing an unfinished booking restarts its route; saved appointments persist in localStorage. No separate payment store or backend is used.
