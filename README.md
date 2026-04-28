# Edge Service

Lightweight Node/Express API that powers the UI's dynamic content.
The UI (`ui-service`) reads from these endpoints so non-developers can update
countries, services, and contact info without touching the front-end code.

## Run

```powershell
cd edge-service
npm install
npm run dev      # auto-restart on change (Node 18+)
# or
npm start
```

Server listens on **http://localhost:4000** by default. Override with `PORT=...`.

Data is persisted as JSON files in `edge-service/data/`. Edit those files
directly, or use the PUT/POST/DELETE endpoints below.

## Endpoints

Base URL: `http://localhost:4000/api`

### Countries

| Method | Path                                  | Description                         |
| ------ | ------------------------------------- | ----------------------------------- |
| GET    | `/countries`                          | List all countries                  |
| GET    | `/countries/:code`                    | Get one country by code (e.g. `US`) |
| POST   | `/countries`                          | Create a new country                |
| PUT    | `/countries/:code`                    | Replace/update a country            |
| DELETE | `/countries/:code`                    | Remove a country                    |
| POST   | `/countries/:code/services`           | Add a service to a country          |
| PUT    | `/countries/:code/services/:key`      | Update one service                  |
| DELETE | `/countries/:code/services/:key`      | Remove one service                  |

### Contacts

| Method | Path        | Description                                 |
| ------ | ----------- | ------------------------------------------- |
| GET    | `/contacts` | Get phone, email, hours, address, socials   |
| PUT    | `/contacts` | Replace contact info                        |

### Health

| Method | Path      | Description |
| ------ | --------- | ----------- |
| GET    | `/health` | `{ok:true}` |

## Wiring the UI

In the UI workspace root create `.env`:

```
VITE_API_BASE_URL=http://localhost:4000/api
```

then restart `npm run dev`.
