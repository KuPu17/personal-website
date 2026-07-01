# Block icons (SVG)

Drop one file per block type. The app loads them automatically:

| File | Block type |
|------|------------|
| `website.svg` | Website links |
| `project.svg` | GitHub / Hugging Face projects |
| `blog.svg` | Blog posts |
| `email.svg` | Email (mailto) |
| `linkedin.svg` | LinkedIn |
| `inbox.svg` | Anonymous inbox |

## How to add your icons

**Option A — files (recommended)**  
1. Export each icon from Figma as SVG  
2. Save into this folder with the names above  
3. Run `npm run dev` — icons appear on the blocks  

**Option B — paste in chat (Agent mode)**  
Send the raw SVG markup for each icon and say which type it is.  
Example: “This is `website.svg`” followed by the `<svg>...</svg>` code.

**Option C — Figma export settings**  
- Format: SVG  
- Include “id” only if needed; prefer outline/stroke as you designed  
- Icon should fit roughly 63×63px (the green/olive tile behind it is drawn in CSS)

Until files exist, placeholder icons are shown.
