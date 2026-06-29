# Off We Go Again Travel — website

A complete static website. Five linked pages, no build step, no dependencies. Drop the whole folder on Vercel and it works.

## Pages
- `index.html` — Home
- `holidays.html` — Our Holidays (the four offerings + the two ways to work with you)
- `story.html` — Our Story (with the hand-signed sign-off)
- `why.html` — Why Us (incl. booking direct vs with you, and protection)
- `plan.html` — Plan Your Trip (the personal enquiry form)
- `assets/` — stylesheet, embedded signature font, logo and photos

## Before it goes live — two things to do

### 1. Connect the enquiry form (so it actually emails you)
The form on `plan.html` is wired for **Formspree** (free tier is fine).
1. Go to https://formspree.io, sign up with **hello@offwegoagaintravel.co.uk**.
2. Create a new form — it gives you an endpoint like `https://formspree.io/f/abcdwxyz`.
3. In `plan.html`, find this line near the form:
   `<form action="https://formspree.io/f/your-form-id" method="POST">`
   Replace `your-form-id` with your real ID (e.g. `abcdwxyz`).
That's it — enquiries land in your inbox. (Formspree also lets you set a custom "thank you" redirect if you want one later.)

### 2. Don't publish until you're registered
The footer states you're "an Independent Travel Consultant with Jamie Wake Travel" and shows PTS / ATOL protection, as Jamie Wake Travel / ITC require. Keep the site unpublished (or password-protected on Vercel) until your registration is confirmed, then it's accurate and good to go.

## Deploy to Vercel
**Easiest (drag & drop):**
1. Zip is already provided, or use this folder.
2. Go to https://vercel.com → Add New → Project → drag the folder in. Done.

**Or via CLI:**
```
npm i -g vercel
cd off-we-go-again-site
vercel
```
No framework, no settings to change — it's plain HTML.

## Placeholders still to swap
- Phone number `07500 123456` (footer) — put your real number or remove.
- Instagram link `@offwegoagain` currently points to `#` — set the real URL once the account's live.
- Photos in `assets/` are the ones you sent. Swap any time by replacing the file with the same name.
- The logo is a crisp built-in SVG in the header/footer. The `logo.png` in assets is your original, kept for reference / favicon use.

## Editing copy
All text is plain HTML — open any `.html` file and edit directly. Styling lives entirely in `assets/style.css`.
