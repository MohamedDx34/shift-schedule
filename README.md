# Shift Schedule

Weekly shift roster with leave requests. Plain HTML/CSS/JS, no build step.

## Files
- `index.html` - page shell
- `styles.css` - all styles (colors are CSS variables at the top)
- `app.js` - app logic
- `config.js` - your Firebase config
- `seed.html`, `seed-data.js` - one-time setup of the admin and the 21 employees
- `firestore.rules` - paste into Firebase console > Firestore > Rules

## Setup
1. Create a Firebase project and a Firestore database (production mode).
2. Add a web app, copy its config into `config.js`.
3. Paste `firestore.rules` into the Firestore rules tab and publish.
4. Serve the folder (`npx serve .` or GitHub Pages), open `seed.html`, click the button once, then delete `seed.html` and `seed-data.js`.
5. Sign in as admin `7023` / `987654321` and change the password in Settings.

Employees sign in with their account number (7028, 7034, ...) and password `123456`.

The demo mode uses the same default credentials: admin account `7023` with password `987654321`, and employees with password `123456`.

## Deploy on GitHub Pages
Push to a repo, then Settings > Pages > Deploy from branch > `main` / root.

## Shift codes
Stored values stay `ص و م س ج` so old data keeps working; the UI shows AM / MID / PM / LATE / LV (see `LBL` in `app.js`).

## Security note
Sign-in is checked in the browser and the admin password hash is readable from the database. Treat this as a convenience tool for a trusted team.
