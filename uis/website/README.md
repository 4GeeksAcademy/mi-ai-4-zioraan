# Brasaland Public Website

Static HTML, compiled Tailwind CSS and vanilla JavaScript. English is the initial
language; Spanish is a future enhancement.

## Current Status

The landing page and Brasa Points registration experience are implemented. The
website includes responsive navigation, company information, local imagery and
fonts, Restaurant structured data, and all eleven registration fields. Submission
is simulated: no personal information is transmitted or stored by the application.

## Prerequisites

- Node.js 20 or newer and npm. Development setup uses Node.js 24.
- Run the following commands from the repository root.

## Install And Build

```powershell
npm --prefix uis/website ci
npm --prefix uis/website run build
```

The build produces `assets/site.css`. Generated CSS and local dependencies are
ignored by Git. Rebuild after changing HTML, JavaScript utility classes or theme
tokens. Visual styling uses Tailwind utilities; `styles.css` contains the Tailwind
entry, source declarations, local font declarations and theme tokens.

## Local Preview

```powershell
npm --prefix uis/website run preview
```

Open <http://127.0.0.1:3000/> or
<http://127.0.0.1:3000/application.html>. Stop the server with Ctrl+C.

An equivalent root-run `npx` command is:

```powershell
npx http-server uis/website -p 3000 -a 127.0.0.1 -c-1
```

If port 3000 is occupied, use a different port, such as `-p 3001`, with the
`npx` command. The first `npx` run may ask to install http-server in its cache.

The current development preview and saved audits use port 4173:

```powershell
npx http-server uis/website -p 4173 -a 127.0.0.1 -c-1
```

To rebuild CSS automatically, run this in a separate terminal while previewing:

```powershell
npm --prefix uis/website run dev
```

## Authoritative Context

- [Company context](../../memory-bank/company-CONTEXT.md)
- [Milestone requirements](../../memory-bank/active-contexts/milestone-one-CONTEXT.md)

The memory-bank is read-only. Its milestone document remains the briefing source
instead of creating a duplicate `BRIEFING.md`.

## Agreed Scope

- No menu section, ordering, reservations, accounts or backend.
- Registration will be simulated without persistence or actual email delivery.
- English only initially; no nonfunctional Spanish toggle.
- Footer year updated to 2026.
- Local Lighthouse evidence replaces public Codespaces hosting. No public URL
  is required for this version.

## Validation And Accessibility

- Country determines available cities; country and city determine favorite locations.
- Dependent selections reset when their parent changes. All 14 supplied restaurants
  are represented, including ten in Colombia and four in Florida.
- Names require at least two words containing letters. Email requires a domain.
  Phone accepts international formatting and checks the selected country's prefix.
- Birth dates are validated as calendar dates with an inclusive eighteenth-birthday
  boundary. Required terms must be accepted; marketing consent starts unchecked.
- Dietary preferences and favorite location remain optional. No restrictions cannot
  be combined with specific dietary preferences.
- Errors are associated with fields, an error summary is announced, and invalid
  submission focuses the first failing field. Success is announced and prevents
  duplicate submission. Clear restores values, options, errors and consent defaults.
- With JavaScript disabled, registration stays disabled and provides a contact link.

The briefing's success message is reproduced, including its confirmation-email
wording, but no email is actually sent. No backend, account or real loyalty balance
is created. Production use would require approved program terms, privacy policies,
server-side validation and secure data handling; those are outside this milestone.

## Future Spanish Support

`data.js` separates domain values from English option labels and validation/success
messages. `validation.js` does not depend on translated labels. A Spanish release
must also translate the static HTML, navigation and accessibility labels, add a real
language selector, and update document language and structured-data language together.
There is deliberately no inactive language switch in this English-only release.

## Verification Evidence

Measured on October 28, 2026 using Lighthouse 13.6.0 with its default mobile profile,
simulated throttling and the locally installed Microsoft Edge Chromium browser.
Reports audited `http://127.0.0.1:4173/` and its `application.html` page.

| Page | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Landing | 97 | 100 | 100 | 100 |
| Registration | 99 | 100 | 100 | 100 |

- [Landing audit](./evidence/landing-mobile.report.html)
- [Registration audit](./evidence/registration-mobile.report.html)
- [Landing desktop screenshot](./evidence/landing-desktop.png)
- [Landing mobile screenshot](./evidence/landing-mobile.png)
- [Registration desktop screenshot](./evidence/registration-desktop.png)
- [Registration mobile screenshot](./evidence/registration-mobile.png)

Structured JSON reports are saved beside their HTML versions. Scores vary with
browser version and machine load. Automated accessibility scores do not replace
assistive-technology testing.

Focused checks covered responsive layout around 375, 768 and 1440 CSS pixels,
mobile navigation and Escape handling, labels, required-field errors, invalid
formats, country/phone mismatches, all restaurant options, dependent resets,
birthday boundaries, optional fields, successful submission and complete reset.
Build and editor diagnostics passed; browser checks found no failed resources or
page errors. No new automated test files were added.

To reproduce a mobile audit with Chrome or Chromium available:

```powershell
npx --yes lighthouse http://127.0.0.1:4173/ --chrome-flags="--headless" --output=html --output=json --output-path=./uis/website/evidence/landing-mobile --no-enable-error-reporting
```

If Chrome is not installed on Windows, set `CHROME_PATH` to an installed Edge
executable before running Lighthouse, for example:

```powershell
$env:CHROME_PATH = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
```

## Asset Sources

- Food photography: [hero source](https://images.unsplash.com/photo-1544025162-d76694265947)
  and [story source](https://images.unsplash.com/photo-1555939594-58d7cb561ad1),
  used under the [Unsplash license](https://unsplash.com/license). These are
  illustrative stock photographs, not photographs of actual Brasaland locations.
  Local WebP variants reduce download size and avoid third-party requests at runtime.
- Barlow and Barlow Condensed: locally hosted WOFF2 assets from Fontsource,
  distributed under the SIL Open Font License. See
  [font license](./assets/fonts/Barlow-LICENSE.txt).
- Menu and arrow icons: [Lucide](https://lucide.dev/), with its
  [license](./assets/lucide-LICENSE.txt) included locally.