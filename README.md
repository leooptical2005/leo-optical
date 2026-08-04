# Leo Optical Website

The official website for **Leo Optical** — a family-owned optician at Jane Finch Mall, Toronto (3929 Jane St, North York, ON M3N 2K1).

A fast, lightweight site with no build step and no framework — just plain HTML, CSS, and JavaScript.

## What's inside
```
leo-optical/
├── index.html              → all page content (hero, gallery, services, direct billing, testimonials, visit, contact)
├── styles.css              → all styling, colors, layout, responsive rules
├── script.js               → contact form handling, image slideshows, mobile nav, scroll reveals
├── images/
│   ├── brand/              → Leo Optical logo
│   ├── gallery/             → style/lifestyle photos + real in-store photos
│   └── insurance/           → insurance provider logos
├── robots.txt / sitemap.xml → SEO
└── README.md                → this file
```

## Preview it locally
Just double-click `index.html`, or drag the folder into a browser. No install, no server needed.

## Contact form
The Contact section submits to a Google Apps Script Web App, which:
- Adds every submission as a row in a Google Sheet
- Emails the shop for each new inquiry, with **Reply-To** set to the customer's email — so replying is just hitting "Reply" like a normal email

Name, Email, Phone, and Message are all required fields.

**If the Apps Script code ever needs updating:** open the Google Sheet → **Extensions → Apps Script** → make your changes → **Deploy → Manage deployments → Edit → New version**, so the existing URL picks up the change automatically (no need to update `index.html` or `script.js` again).

## Content notes
- **Booking:** there's no online booking calendar — all "Book an Eye Exam" buttons link directly to `tel:14166382439` so visitors call the shop.
- **Frame gallery:** auto-advancing slideshow at the top of the page, and a second "Inside Leo Optical" slideshow further down with real photos of the showroom.
- **Direct billing / insurance logos:** the logo grid can take more providers any time — just add an image to `images/insurance/` and add a matching `<div class="insurance-logo">` entry in `index.html`.
- **Hours, pricing, and address** are current as of the last update. Double check with the shop before any future changes go live.

---

### Developed by
**Imran Khan Pathan**
pathanbz9019@gmail.com
