# Emerson University Multan Student Result Portal

Static result portal for the BS Cyber Security evening session (2023-2027).

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

- `index.html` and `pages/`: portal pages.
- `assets/css/`: portal, document, analytics, and print styles.
- `assets/js/`: search, rendering, print, and portal interaction code.
- `assets/data/`: JSON consumed by the running site.
- `service-worker.js`: offline cache configuration.

## Deployment

Publish the project root to GitHub Pages. All application URLs are relative, so the portal supports repository subpaths such as [Cyber Result Portal](https://ranaarifdev.github.io/Cyber-result-portal/).

## Privacy

This static site contains academic data. JSON files on a public host can be downloaded by anyone with access to the deployment; host it publicly only with appropriate authorization.
