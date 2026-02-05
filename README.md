# Sreya Portfolio (GitHub Pages)

This is a single-page portfolio site (HTML/CSS/JS) designed for **data/business analytics** roles.

## Deploy on GitHub Pages (fast)

1. Create a new repo (example: `sreya-portfolio`).
2. Upload these files to the repo root:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `assets/` folder
   - `Sreya_Kambhatla_Resume.pdf`
3. Repo → **Settings** → **Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` / `(root)`
4. Your site will appear at: `https://<username>.github.io/<repo>/`

## Customize (important)

- Replace placeholder links in `script.js`:
  - `state.links.github`
  - `state.links.linkedin`
- Update project links in `index.html` (the `window.__PROJECTS__` block) if you have live demos.

## Local preview

Open `index.html` directly, or run a tiny server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000
