# Emerson University Multan Student Result Portal

Static result portal for the BS Cyber Security evening session (2023-2027).

## Project location

- Local workspace path: `D:\websites\Generate trnscript`
- GitHub repository: [ranaarifdev/Cyber-result-portal](https://github.com/ranaarifdev/Cyber-result-portal)
- GitHub Pages site: [Cyber Result Portal](https://ranaarifdev.github.io/Cyber-result-portal/)

## Run locally

```bash
python -m http.server 5500
```

Open `http://localhost:5500/` in a browser. A web server is required because the portal loads local JSON data.

## Included features

- Exact roll-number search across the supplied student records.
- Semester result cards and complete transcripts with browser print/PDF support.
- Merit, Supply History, and MZ participant views based on the verified portal dataset.
- Responsive, offline-capable static hosting with no runtime API or database.

## Project structure

- `index.html`: landing portal page.
- `pages/`: secondary portal pages such as result detail, privacy, terms, and about content.
- `assets/css/`: portal, document, analytics, and print styles.
- `assets/js/`: search, rendering, print, analytics, and portal interaction logic.
- `assets/data/`: JSON datasets consumed by the site.
- `assets/images/`: static UI assets and branding.
- `service-worker.js`: offline cache configuration.
- `LICENSE`, `.gitignore`, and `.nojekyll`: project and hosting configuration files.

## Deployment

Publish the project root to GitHub Pages. All application URLs are relative, so the portal supports repository subpaths and the live site is available at [Cyber Result Portal](https://ranaarifdev.github.io/Cyber-result-portal/).

## Privacy

This static site contains academic data. JSON files on a public host can be downloaded by anyone with access to the deployment; host it publicly only with appropriate authorization.
