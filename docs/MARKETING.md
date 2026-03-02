# Marketing & SEO for Phlick

Ideas for promoting the **Android app** and **web app**, plus an SEO checklist for the web version.

---

## Web app SEO (done & next steps)

### Already in place
- **index.html**
  - `<title>Phlick – Prayer Flick Trainer</title>`
  - `<meta name="description">` for search snippets
  - `<meta name="theme-color">` (#2A1810)
  - **Open Graph** (`og:title`, `og:description`, `og:image`, `og:site_name`, `og:type`) for link previews (Facebook, Discord, etc.)
  - **Twitter Card** (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) for Twitter/X previews
- **robots.txt** in `web/public/` (allows all crawlers; copied to build root)

### Recommended next steps
1. **Add `og-image.png`**  
   Place a 1200×630px image at `web/public/og-image.png` (or update the meta tags to your real URL). Used when the site is shared; without it, previews may fall back to favicon or nothing.
2. **Canonical URL**  
   When you have a live domain, set a canonical in `<head>` and use **absolute URLs** for `og:image` and `twitter:image` (e.g. `https://phlick.example.com/og-image.png`). Can be done via env at build time.
3. **Sitemap**  
   For a single-page app, a minimal `sitemap.xml` with the main URL is enough. Add the path to `robots.txt` (`Sitemap: https://your-domain.com/sitemap.xml`) once the site is live.
4. **Structured data (optional)**  
   Add JSON-LD for a “WebApplication” or “Game” (name, description, url) to help search engines understand the product.

---

## Marketing ideas

### Organic / community
- **OSRS subreddit** (r/2007scape): Short post or comment when it fits (“I made a prayer flick trainer – link”). Avoid pure self-promo; frame as a tool for the community.
- **OSRS Discord servers**: Share in relevant channels if the server allows it (e.g. “tools” or “guides”).
- **YouTube / Twitch**: One short “how to use Phlick” or “practice flicking with Phlick” clip; link in description. Streamers who teach PvM could mention it.
- **Word of mouth**: Share with friends who play OSRS; ask for feedback and “share if you find it useful.”

### App stores
- **Google Play**
  - Strong **short title** and **short description** with “prayer flick”, “OSRS”, “trainer”.
  - **Screenshots**: in-game (level select, mid-level, level complete), plus one with the 1-tick helper if you want to highlight it.
  - **Feature graphic** (1024×500) that matches the dark brown / gold look.
- **Web**
  - If you list the web app anywhere (e.g. “Play in browser” link from Reddit/Discord), the new meta description and OG/Twitter tags will improve how those links look.

### Content / SEO long term
- **Simple landing or “About” page** (you may already have this in the app): one paragraph on “What is Phlick”, “How it helps with prayer flicking”, “Browser + Android”. Reuse the same wording as the meta description for consistency.
- **Blog post or guide** (on your own site or Medium): “How to practice 1-tick prayer flicking for OSRS” with a section like “Using Phlick to train”. Link to the web app and Play Store; internal links help SEO.

### Paid (optional)
- **Reddit ads**: Target r/2007scape or “Old School RuneScape” interests; small budget to test.
- **Google App Campaigns**: Promote the Android app for queries like “OSRS prayer flick” or “RuneScape prayer trainer” if you want to experiment with paid installs.

---

## Quick checklist before “launch”

- [ ] `web/public/og-image.png` added (1200×630) and meta tags point to it (or to full URL when deployed).
- [ ] Deployed web app uses HTTPS and a stable base URL for canonical and sitemap.
- [ ] Play Store listing: title, description, and screenshots stress “prayer flick” and “OSRS”.
- [ ] One place (Reddit, Discord, or a short video) where you share the link and describe who it’s for.
