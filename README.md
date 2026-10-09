# Recall v2

A black-and-red, local-first command library for CTFs, lab work, and the commands you never want to search your history for again.

## Host on GitHub Pages

The downloadable GitHub package has the website files at its root. No build, npm install, backend, API key, or database is required.

1. Create a GitHub repository (for example `recall`).
2. Upload the **contents** of this package to the repository root, keeping `index.html`, `app.js`, `core.js`, `style.css`, `favicon.svg`, and `library.json` together. Include `.nojekyll` if your upload method supports hidden files.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select **main** and **/(root)**, then save. GitHub displays the site URL when deployment finishes.

All asset paths are relative, so both `username.github.io/recall/` and a custom domain work.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

If working from the original Sites source checkout, the deployable website is in `dist/`; copy its contents to the root of your GitHub repository. The downloadable ZIP already has this layout.

## What’s new in v2

- Refined black-and-red interface with compact list and card layouts, consistent spacing, and responsive controls.
- Create empty collections, rename a collection and its commands, or remove it while keeping commands in Unsorted.
- Group commands by collection or platform, collapse groups, and add a command directly into a collection.
- Select all filtered results or individual commands, then move, tag, or delete them together. Selection is limited to visible search/filter results.
- Undo the last edit, bulk operation, deletion, or collection change in the current tab. A later edit replaces the undo history; a reload or change from another tab clears it. Copying does not replace the undo history.
- Duplicate from a command’s detail view, import into a chosen collection, clear filters, and save the editor with Ctrl/Cmd+Enter.
- Layout and grouping preferences persist in this browser. Existing v1 commands load automatically using the same storage key; no reset or re-import is needed.
- Exports include collection names, including empty collections, and remain compatible with v1 command records.

## Daily use

- Press **N** or click **Add command**. Paste a command; title and description are optional. Multiline commands are supported.
- Organize by collection, platform, and comma-separated tags.
- Click **Copy explanation prompt for your LLM**, paste it into your preferred model, then paste the explanation back into Recall. There is no automatic API integration or key storage.
- Press **/** to search titles, commands, descriptions, tags, categories, platforms, and notes. All search terms must match somewhere in an entry.
- Favorite common commands. **Recently copied** shows commands copied from Recall.
- Use `{{target}}`, `{{port}}`, `{{path}}`, or another named placeholder. **Fill & copy** opens fields and a live preview. All placeholders must be filled before copying. Values are inserted literally; Recall does not escape or validate shell syntax. Review quoting yourself.
- **Import** accepts a Recall JSON backup, an array of command objects, a single command object, or plain-text shell history (one command per line). Numeric history prefixes are removed. Use JSON to preserve multiline commands. A formatting prompt is provided for your LLM.
- Imports merge and skip commands with identical text (ignoring outer whitespace); they do not overwrite existing descriptions. To revise a command, edit it directly.
- **Quick guide → Remove example commands** removes untouched seed examples. Editing an example turns it into your own entry.

## Where commands are saved

Recall stores the collection in this browser’s localStorage under `recall.command-library.v1`, scoped to the site origin. Edits are **not** pushed to GitHub and do not automatically sync between devices. The app contains no command execution or LLM requests. Clipboard permissions may be required; there is a fallback when available.

Use **Export → Download JSON backup** regularly. Browser data clearing, private browsing, a new origin, or a different browser can mean a fresh collection. Multiple Recall copies under the same origin share the same storage key.

### Repository-backed starting collection

Export **library.json**, replace the repository’s file, and commit it. A browser with no stored collection loads that file on first visit. Browsers with an existing collection keep their local edits; import the file to merge newly added commands. Exporting does not commit the file for you.

GitHub Pages normally serves publicly accessible content even from a private repository. Anything in the published `library.json` is downloadable by visitors. Keep credentials, tokens, and private notes out of a published starting collection. Local-only additions are not uploaded by Recall.

### JSON format

```json
{
  "version": 1,
  "commands": [
    {
      "title": "Service detection",
      "command": "nmap -sV {{target}}",
      "description": "Identify service versions on a lab target.",
      "category": "Reconnaissance",
      "platform": "Linux",
      "tags": ["nmap", "enumeration"],
      "notes": "Optional context or prerequisites",
      "favorite": true
    }
  ]
}
```

Only `command` is required. Platform values are `Linux`, `Windows`, or `Cross-platform`. Unknown platforms default to Linux. IDs and timestamps are generated when omitted. Version 1 backups also retain favorites, copy timestamps, creation dates, and update dates. Files are limited to 10 MB and imports to 10,000 entries per batch.

## Local development

Serve this directory over HTTP; opening `index.html` as `file://` is not supported because JavaScript modules and fetching the starting library require a web origin.

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8080. Clipboard access is supported on HTTPS and localhost in browsers that implement the Clipboard API.

## Implementation

- Plain HTML, CSS, and native JavaScript modules; no build step or third-party runtime dependencies.
- System fonts and local SVG favicon; no CDN dependencies or analytics.
- Text content and command syntax are escaped before rendering. No `eval`, command execution, or HTML rendering of imported notes.
- Native dialogs, keyboard shortcuts, visible focus states, and reduced-motion support.
- Search, JSON validation, deduplication, collection grouping, bulk edits, and literal variable substitution are in `core.js`.

## Verification

Core tests cover imports, malformed records, duplicate handling, search filters, placeholder substitution, HTML escaping, bulk moves, collection renaming, grouping, and immutable edits used by undo. JavaScript syntax and static HTML asset references were also checked. Visual browser QA was not available in the build environment.
