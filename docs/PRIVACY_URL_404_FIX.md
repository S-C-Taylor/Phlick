# Fix “Privacy policy URL returns 404” (Google Play)

Google’s crawler requests **https://phlick.net/privacy** directly. If the server returns **404**, Play Console rejects the app even though the page works when you open it in the browser (client-side routing).

**Cause:** The app is a single-page app (SPA). The path `/privacy` only exists in the client; there is no real file at `/privacy` on the server. The host must be configured to **serve `index.html` for all paths** and return **200**, not 404.

---

## Fix by hosting platform

### AWS Amplify (most likely if phlick.net is on Amplify)

1. Open **AWS Amplify Console** → your app → **Hosting** (or **App settings** → **Hosting**).
2. Go to **Redirects and rewrites** (or **Rewrites**).
3. Add a **rewrite** (not redirect) so that non-file requests return `index.html` with status **200**:
   - **Source address:** `/<*>`
   - **Target address:** `/index.html`
   - **Type:** **Rewrite (200)**  
     (Do **not** use “Redirect (404)” — that keeps the 404.)
4. Save and redeploy. Wait for the new version to be live.
5. Test:  
   `curl -I https://phlick.net/privacy`  
   You should see `HTTP/2 200` (or `HTTP/1.1 200`).

**JSON form** (if your Amplify version uses a JSON editor for redirects):

```json
[
  {
    "source": "/<*>",
    "target": "/index.html",
    "status": "200",
    "condition": null
  }
]
```

---

### Netlify

The repo already has **`web/public/_redirects`** with:

```
/*    /index.html   200
```

- Ensure the **build output directory** includes this file (e.g. `dist` or `build` so that `_redirects` is at the **root** of the deployed site).
- Redeploy. Then:  
  `curl -I https://phlick.net/privacy`  
  should return **200**.

---

### Vercel

The repo has **`web/vercel.json`** with rewrites to `/index.html`. Deploy from the repo (or re-deploy) so this file is used. Then check:

`curl -I https://phlick.net/privacy` → **200**.

---

### Firebase Hosting

Use **`web/firebase.json`** (already in repo). Build the app (e.g. `npm run build` in `web/`), then deploy:

```bash
cd web && npm run build && firebase deploy
```

Ensure `hosting.public` in `firebase.json` matches your build output (e.g. `dist`). Then:

`curl -I https://phlick.net/privacy` → **200**.

---

## After fixing

1. Confirm in a **private/incognito** window: open **https://phlick.net/privacy** and confirm the privacy content loads.
2. Confirm with curl:  
   `curl -I https://phlick.net/privacy`  
   First line should be `HTTP/2 200` (or similar).
3. In **Play Console** → **App content** → **Privacy policy**, the URL can stay **https://phlick.net/privacy**. No need to change it unless you move the site.
4. **Send the app for review** again (e.g. from **Publishing overview**).

Once the server returns 200 for `https://phlick.net/privacy`, the “Invalid Privacy policy” rejection should be resolved.
