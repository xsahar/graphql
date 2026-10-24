# Developer Portfolio Dashboard

<p align="center">
  <strong>A modern, responsive developer portfolio powered by GraphQL.</strong><br>
  Explore profile metrics, project progress, coding languages, and public GitHub work in one place.
</p>

<p align="center">
  <a href="https://xsahar.github.io/graphql/"><strong>View the live portfolio →</strong></a>
</p>

## Why this project?

This dashboard turns learning data into a polished portfolio experience for sharing with companies and collaborators. It combines authenticated GraphQL metrics with a live overview of public GitHub repositories, so the profile reflects both progress and practical work.

## Highlights

- **Portfolio-first profile** with a clear introduction, availability status, and GitHub link
- **Live project showcase** that loads public repositories and links directly to each project
- **Language overview** detected from the code in the project portfolio
- **Learning metrics** including total XP, audit ratio, and project activity
- **Interactive SVG charts** for audit performance and XP by project
- **Secure authentication** using JWT sessions
- **Responsive design** for desktop, tablet, and mobile

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Data layer | GraphQL |
| Authentication | JWT and session management |
| Visualizations | Native SVG |
| Portfolio data | GitHub REST API |
| Hosting | GitHub Pages |

## Project structure

```text
.
├── index.html              # Portfolio and login interface
├── css/
│   └── main.css            # Responsive visual system and layout
└── js/
    ├── auth.js             # Authentication state
    ├── authform.js         # Login form handling
    ├── charts.js           # SVG charts
    ├── graphql.js          # GraphQL helpers
    ├── main.js             # Application initialization
    ├── profile.js          # Profile, projects, and languages
    ├── sessionManager.js   # JWT session lifecycle
    └── utils.js            # Shared formatting helpers
```

## Run locally

Because the app uses browser modules, API requests, and authentication, serve it through a local web server rather than opening `index.html` directly:

```bash
git clone https://github.com/xsahar/graphql.git
cd graphql
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Data and privacy

The dashboard requests authenticated learning data only after sign-in. Public repository and language information is loaded from the GitHub API using the authenticated user's public profile. Do not commit credentials, tokens, or `.env` files.

## Roadmap

- Add project filtering by language
- Add a timeline of recent activity
- Add downloadable CV export
- Add theme preferences

## License

This project is maintained as a personal portfolio and learning project.
