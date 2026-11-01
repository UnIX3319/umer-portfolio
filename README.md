# Umer Shoaib — Portfolio

Static site: HTML5, CSS3, vanilla JavaScript. No build step, no dependencies.

## Run locally
```
python3 -m http.server 8080      # then open http://localhost:8080
```
(or just open `index.html`, or use VS Code "Live Server")

## Files you still need to add
| File | Purpose |
|------|---------|
| `assets/images/umer.jpg` | Your real photo (portrait, ~4:5, 800×1000 or larger). Until added, an "US" monogram placeholder shows. |
| `assets/resume/umer-shoaib-resume.pdf` | Your resume. Until added, the button shows a notice instead of a broken download. |

## Project links
Cards show no buttons because no real URLs were provided. To add them, see the comment above `<ul class="projects">` in `index.html`.
To use real screenshots, replace a card's `.thumb` block with `<img src="assets/images/xyz.jpg" alt="..." loading="lazy">`.

## Contact form
Default: opens the visitor's email app with the message pre-filled (nothing is sent by the site itself).
To send directly, add a form endpoint (e.g. Formspree): `<form id="contact-form" data-endpoint="https://formspree.io/f/YOUR_ID" ...>`.

## Structure
```
index.html
css/styles.css   tokens → base → layout → components → sections → motion
js/main.js       theme, nav, scroll, reveal, filters, form, etc.
assets/images/   assets/resume/
```
