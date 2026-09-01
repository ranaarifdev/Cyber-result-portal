# Emerson University Multan Student Result Portal

Static result portal for the BS Cyber Security evening session (2023-2027).

## Project location

- Local workspace path: `D:\websites\Generate trnscript`
- GitHub repository: [ranaarifdev/Cyber-result-portal](https://github.com/ranaarifdev/Cyber-result-portal)
- GitHub Pages site: [Cyber Result Portal](https://ranaarifdev.github.io/Cyber-result-portal/)

## Overview

This project is a static academic portal built for Emerson University Multan students to search for semester results, view transcripts, review merit rankings, and inspect official academic records without requiring a backend server or database. The site is designed to be easy to host on GitHub Pages and to work locally through a simple static server.

## Main features and functions

### 1. Result search and lookup
- Exact roll-number search with case-insensitive matching.
- Input validation for invalid or incomplete roll numbers.
- Example roll-number shortcut for quick testing.
- Redirects to a dedicated result page for the matched student.

### 2. Student result dashboard
- Student profile card with program, department, session, shift, current semester, CGPA, and status.
- Academic overview tab showing semester count and progress summary.
- Semester-by-semester result navigation for available records.
- Result status indicators for promoted and active records.

### 3. Semester result cards
- Generates a printable result card for each semester.
- Shows course code, course title, grade points, SGPA, CGPA, and result status.
- Includes print and PDF export buttons.
- Designed for A4/print-friendly rendering.

### 4. Complete transcript view
- Displays a full transcript for the selected student.
- Shows all available semesters in a consolidated document.
- Includes transcript summary metadata and signatures section.
- Supports printable transcript export and PDF save.

### 5. Merit and achievement ranking
- Calculates semester toppers using verified SGPA rankings.
- Displays CGPA ranking for students with complete six-semester records.
- Shows methodology description for ranking logic.
- Excludes incomplete records from final CGPA ranking.

### 6. Supply history and records
- Provides supply/fail history support for the approved student cohort.
- Allows filtering by student name, roll number, subject name, course code, semester, and subject.
- Offers grouped views by student or by semester.
- Includes print and PDF actions for supply reports.
- Displays privacy notice before exposing identifiable records.

### 7. MZ participant data
- Displays MZ (Zero Math) zero-credit participant information.
- Supports filtering and sorting by roll number, name, subject, result, and CGPA.
- Includes print and PDF output for MZ participant lists.
- Provides a privacy-aware access flow for limited academic data.

### 8. Notices and downloads
- Dedicated section for academic documents and downloadable result resources.
- Quick access to transcript and semester result download actions.
- Centralized document support for users without leaving the main page.

### 9. Grading system guide
- Explains the portal interpretation of grade points.
- Shows passing and non-passing rules based on verified source data.
- Includes SGPA and CGPA formula explanation with an example.

### 10. About and contact section
- Website overview and project information.
- Developer details and university program information.
- GitHub profile link.
- Email contact support form that opens a mail draft.

### 11. FAQ and help
- Common questions about result lookup and downloads.
- Guidance on roll-number entry and browser support.
- Troubleshooting instructions for cached data and offline behavior.
- Contact support details for users needing help.

### 12. Privacy and security notice
- Explains that the site runs locally, without tracking or server-side data processing.
- Warns that static public hosting exposes the downloaded JSON files to anyone with access.
- Encourages local or authorized deployment only.

### 13. Offline and static hosting support
- Service worker cache for offline access to core site assets.
- Static hosting ready for GitHub Pages or similar static deployment.
- No runtime API or database required.
- Browser-based frontend behavior only.

### 14. Responsive and accessible UI
- Mobile-friendly layouts and navigation.
- Skip-to-content accessibility link.
- Keyboard navigation and ARIA labeling for major interactive elements.
- Print-focused CSS to preserve readability during PDF export.

## Run locally

```bash
python -m http.server 5500
```

Open `http://localhost:5500/` in a browser. A web server is required because the portal loads local JSON data.

## Project structure

- `index.html`: landing portal page.
- `pages/`: secondary pages including result details, privacy, terms, and developer information.
- `assets/css/`: portal, print, transcript, and result styling.
- `assets/js/`: search logic, renderer logic, data loading, PDF/print handling, and portal interactions.
- `assets/data/`: static JSON result datasets used by the site.
- `assets/images/`: institutional branding and visual assets.
- `service-worker.js`: offline cache configuration.
- `LICENSE`, `.gitignore`, and `.nojekyll`: project and hosting configuration files.

## Deployment

Publish the project root to GitHub Pages. All application URLs are relative, so the portal supports repository subpaths and the live site is available at [Cyber Result Portal](https://ranaarifdev.github.io/Cyber-result-portal/).

## Privacy

This static site contains academic data. JSON files on a public host can be downloaded by anyone with access to the deployment; host it publicly only with appropriate authorization.

## Notes

- The project is a fully client-side static interface.
- It depends on local data files and browser-side rendering.
- It is built for academic record access, not for public student data publication without authorization.
