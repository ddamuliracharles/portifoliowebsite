# Portfolio — Ddamulira Charles Lugemwa

ASP.NET Core portfolio site showcasing projects from [GitHub @ddamuliracharles](https://github.com/ddamuliracharles).

## Run locally

```bash
dotnet restore
dotnet run
```

Open **https://localhost:5001** or the URL shown in the terminal (HTTP port is in `Properties/launchSettings.json`).

## Configuration

In `appsettings.json`:

```json
"GitHub": {
  "Username": "ddamuliracharles"
}
```

Projects load live from the GitHub API when available; otherwise a curated fallback list is used.

## Deploy

### Option 1 — Vercel (recommended for this site)

Vercel hosts the static export of this portfolio (same design, GitHub projects load in the browser).

**From GitHub (easiest):**

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects `vercel.json` — click **Deploy**.

**From CLI:**

```bash
npm run build
npx vercel
```

Follow the prompts to log in and deploy.

**Production URL:** [https://ddamuliracharles.dev](https://ddamuliracharles.dev) (also [portifoliowebsite-gold.vercel.app](https://portifoliowebsite-gold.vercel.app))

**Custom domain DNS** — at your `.dev` registrar, add:

| Type | Name | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Vercel will email you when DNS is verified.

Edit static content in `vercel/profile.json`, then redeploy. The ASP.NET app (`dotnet run`) remains for local C# development.

### Option 2 — Azure Web App (.NET server)

1. Create a **Web App** on [Azure Portal](https://portal.azure.com) (Runtime: **.NET 10**).
2. Download the **Publish profile** from the app overview.
3. Push this repo to GitHub and add secret `AZURE_WEBAPP_PUBLISH_PROFILE` (paste the full XML).
4. Rename `AZURE_WEBAPP_NAME` in `.github/workflows/deploy-azure.yml` to your app name.
5. Push to `main` — GitHub Actions builds and deploys automatically.

Manual publish:

```bash
dotnet publish -c Release -o ./publish
# Upload ./publish to Azure (FTP, ZIP deploy, or az webapp deploy)
```

### Option 3 — Docker

```bash
docker build -t portfolio .
docker run -p 8080:8080 portfolio
```

Visit **http://localhost:8080**. Deploy the image to Azure Container Apps, Railway, Render, or any container host.

### Option 4 — IIS / Windows Server

```bash
dotnet publish -c Release -o C:\inetpub\wwwroot\portfolio
```

Install the [.NET 10 Hosting Bundle](https://dotnet.microsoft.com/download) and point an IIS site at the publish folder.

## Customize

- **All projects (personal, private, org, contributions) + diagrams:** `Data/work-catalog.json`
- **Bio & skills:** `Services/PortfolioService.cs` or `vercel/profile.json`
- **Private GitHub repos (local only):** set `GitHub:Token` in `appsettings.Development.json` (never commit tokens)
- **Styles:** `wwwroot/css/site.css`

Each project can include a `mermaidDiagram` field for architecture diagrams (expand **Architecture diagram** on the card).
