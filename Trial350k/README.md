# Trial Salon Demo — Editorial Luxury

Run `npm run dev` and open `http://localhost:5173`. `npm run build` checks JavaScript syntax. The website needs no dependencies or compilation and can be deployed directly to static hosting.

The supplied `assets/images/` folder was empty. All ten original photographs are referenced by their original filenames from the project root. No new imagery or remote assets are used.

`data.js` centralizes salon details, photographs, services, prices and illustrative testimonials. `app.js` provides reusable rendering functions, service tabs, gallery controls and the dedicated booking flow. `styles.css` includes responsive layouts and reduced-motion support.

Booking is an explicitly labeled local demonstration with editable review, confirmation, text download and optional WhatsApp sharing to a contact of the visitor's choice. Nothing is reserved or sent to a salon. Personal data is not persisted. For a real launch, configure verified contact details and a request delivery endpoint. The location link shows the Kololo neighbourhood, not fictional business premises.
