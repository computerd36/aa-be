# AlertAigua Backend

![CI](../../actions/workflows/ci.yml/badge.svg)

Backend for the flood-warning service in Arens de Lledó. Every five minutes it fetches water level and flow rate from the [SAIH Ebro](https://www.saihebro.com) open-data API and compares them with each user's threshold. When a threshold is crossed, it sends a high-priority push notification through [Pushsafer](https://www.pushsafer.com).

## How it works

- **Polling** (`src/jobs/waterDataScheduler.ts`): a cron job fetches sensor data. Failed requests are retried with exponential backoff. If the API stays unreachable or the data gets too old, users get a "service unavailable" notice, and a follow-up once the data is back.
- **Alarms** (`src/services/alarmService.ts`): each user has an alarm state, which is `normal`, `initialAlarm` or `escalationAlarm`. Crossing the threshold triggers the initial alarm. A further rise of 5% escalates it. The alarm clears after 48 consecutive measurements below the threshold (about 12 hours).
- **Registration** (`POST /webhook/pushsafer`): users sign up by adding a device in Pushsafer. Pushsafer then calls this webhook, which creates or deletes the matching user. Requests must include `?secret=<PUSHSAFER_WEBHOOK_SECRET>`.
- **Status** (`GET /status`): returns the latest readings and service health for the frontend.

Messages are available in English, Spanish and Catalan (`src/constants/messages.ts`).

## Tech stack

- Node.js 24, TypeScript, Express
- PostgreSQL with Prisma 7 (`@prisma/adapter-pg`)
- esbuild for bundling
- Vitest with Istanbul coverage
- Biome for linting and formatting
- zod for env and payload validation
- Deployed on Railway, with CI on GitHub Actions

## Getting started

Prerequisites: [pnpm](https://pnpm.io/installation) 9 or newer, and a PostgreSQL database. `.npmrc` pins the Node version, and pnpm installs it automatically.

```bash
git clone https://github.com/computerd36/aa-be.git
cd aa-be
pnpm install
cp .env.template .env      # then fill in the values
pnpm prisma generate       # generate the Prisma client (not done on install)
pnpm prisma db push        # create the tables in your database
pnpm dev
```

`pnpm prisma generate` must be re-run whenever `prisma/schema.prisma` changes. If you skip it, imports like `AlarmState` from `@prisma/client` will not resolve.

### Environment variables

All variables are validated at startup in `src/env.ts`, and the server exits if any are missing or invalid.

| Variable                   | Required | Description                                                       |
| -------------------------- | -------- | ----------------------------------------------------------------- |
| `PORT`                     | no       | HTTP port, default `3000`                                         |
| `NODE_ENV`                 | no       | `development` (default) or `production`                           |
| `CORS_ORIGINS`             | no       | Comma-separated list of allowed frontend origins                  |
| `SAIHEBRO_API_BASE_URL`    | yes      | SAIH Ebro open-data API base URL                                  |
| `SAIHEBRO_BASE_PORT`       | no       | Default `443`                                                     |
| `SAIHEBRO_API_KEY`         | yes      | SAIH Ebro API key (see below)                                     |
| `DATABASE_URL`             | yes      | PostgreSQL connection string                                      |
| `PUSHSAFER_PRIVATE_KEY`    | yes      | 20-character Pushsafer private key                                |
| `PUSHSAFER_WEBHOOK_SECRET` | yes      | At least 32 characters; must match the `secret` query parameter on the webhook URL |

To get a SAIH Ebro API key, [create an account](https://www.saihebro.com/usuarios/registro), then request a key through one of the [contact channels](https://www.saihebro.com/contacto/direcciones).

## Scripts

| Command         | Description                                          |
| --------------- | ---------------------------------------------------- |
| `pnpm dev`      | Build in watch mode and run with live reload         |
| `pnpm test`     | Run the test suite                                   |
| `pnpm coverage` | Run the tests with a coverage report                 |
| `pnpm build`    | Create the production bundle in `dist/`              |
| `pnpm start`    | Apply migrations, generate the client, start `dist/` |

## Deployment

The service runs on Railway:

1. Create a Railway project and link this repository.
2. Add a PostgreSQL database and set the environment variables listed above.
3. Railway runs `pnpm build` followed by `pnpm start` on every push to `main`.
4. In Pushsafer, point the device webhook to `https://<your-domain>/webhook/pushsafer?secret=<PUSHSAFER_WEBHOOK_SECRET>`.

## License

MIT
