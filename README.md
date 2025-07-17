# AlertAigua 🌊 – Flood-Alert Backend

![](../../actions/workflows/ci.yml/badge.svg)

Backend service for the local flood-warning system in **Arens de Lledó**.  
It pulls water-level data from the **SAIH Ebro API**, checks user-defined thresholds and sends high-priority push alerts through **Pushsafer**.

---

## Tech Stack

| Layer               | Tooling / Runtime                       | Rationale                              |
| ------------------- | --------------------------------------- | -------------------------------------- |
| Runtime & Language  | **Node.js 18+**, **TypeScript**         | Async I/O, type safety                 |
| Build & Reload      | **esbuild**                             | Fast bundling/transpiling              |
| Web Framework       | **Express**                             | Minimal, unopinionated                 |
| Lint & Format       | **Biome**                               | Fast linting & auto-fix                |
| Tests               | **Vitest**                              | Unit & API tests                       |
| Coverage            | **Istanbul**                            | Quality gate                           |
| Database            | **PostgreSQL**                          | Efficient queries                      |
| CI/CD               | **GitHub Actions**                      | Lint · Test · Build · Coverage         |
| Deployment          | **Railway** (Docker)                    | Auto-scaling, low ops overhead         |

---

## Prerequisites

- [pnpm](https://pnpm.io/installation) ≥ 7.27  
  *(Installs the correct Node.js version automatically.)*

---

## Quick Start

```bash
# 1 Clone repository
git clone https://github.com/<user>/AlertAigua.git
cd AlertAigua

# 2 Install dependencies
pnpm i
````

### Environment variables
  1. Duplicate the file **`.env.template`** and rename the copy to **`.env.local`** in the project root.
  2. Fill in every variable - leaving any placeholder blank will prevent the server from booting. All values are validated at runtime with **zod**, so typos are caught early.
  3. For the required **SAIH_EBRO_API_KEY**, first [create a SAIH Ebro account](https://www.saihebro.com/usuarios/registro), then request an API key via one of the contact channels listed [here](https://www.saihebro.com/contacto/direcciones).

---

## Scripts

| Command         | Purpose                             |
| --------------- | ----------------------------------- |
| `pnpm dev`      | Start in dev mode with live reload  |
| `pnpm test`     | Run full test suite                 |
| `pnpm coverage` | Run tests **with coverage report**  |
| `pnpm build`    | Create production bundle            |
| `pnpm start`    | Launch built bundle (after `build`) |

---

## Deploying on Railway 🚂

1. Create a new Railway project.
2. Link this repository.
3. Add secrets from the .env.template file to the deployed version
4. Hit **Deploy** – Railway builds the Docker image and scales automatically.

---

## License

MIT – see [`LICENSE`](LICENSE).
