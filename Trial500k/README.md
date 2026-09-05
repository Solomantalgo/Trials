# Trial Salon Demo — Option 3 / Advanced

Run `npm run dev` and open http://localhost:5175. `npm run build` validates JavaScript syntax. `npm test` exercises scheduling, local persistence, clash prevention, timezone conversion and rescheduling rules. No dependencies or compilation are required.

## Functional difference

- Contextual service, category and professional booking routes.
- Eight progressive steps: category, service, professional, date, time, details, notes and review; followed by a reference confirmation.
- Qualified-professional matching, weekly working days, synthetic commitments, 30-minute start intervals and duration-aware scheduling.
- Kampala timezone, future-only slots and a 60-day horizon.
- Structured browser-local appointment records, final clash recheck, same-browser tab notifications, reference retention on rescheduling, cancellation and record removal.
- Calendar export, JSON record download and user-directed WhatsApp sharing.

## Honest demonstration boundary

There is no backend in this project. Availability is simulated; no real appointment is reserved or sent to a salon. Records are stored in localStorage on this browser/device, not permanently or across devices. Storage failure falls back to page-session memory with an explicit notice. Visitors can cancel and remove local records. No payments or customer accounts exist.

## Architecture

`data.js` centralizes business/contact information, the shared 16-service catalogue, prices, durations, four fictional professionals, imagery, testimonials and booking configuration. `booking-core.js` holds pure scheduling rules, record construction, validation, calendar formatting and the repository adapter. `app.js` renders reusable views and wires interaction. `styles.css` provides distinct mobile and desktop layouts and reduced-motion support.

Appointment records include schema version, ID, reference, status, source, created/updated timestamps, timezone, service snapshot, professional snapshot, date, start/end times, customer and notes. A real integration should replace the browser repository with server-side storage, authoritative availability and atomic conflict validation. The browser simulation is not a concurrency-safe production booking backend.

All ten supplied photographs are copied with original filenames into `assets/images/`. The supplied Option 1 image directory was empty; its original photographs were in the project root. Staff are represented by initials, never by client photographs. Contact links show the Kololo neighbourhood or allow user-selected WhatsApp sharing; no real business contact is invented.
