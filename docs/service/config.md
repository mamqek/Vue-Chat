# Configuration

The Vue-Chat service is highly configurable. Below is a list of configuration variables and their descriptions:

| Variable Name        | Default Value                  | Description                                      |
|----------------------|--------------------------------|--------------------------------------------------|
| SERVICE_URL          | `"http://localhost:4000"`    | External URL for the service.                   |
| PORT                 | `4000`                        | The port the service listens on.                |
| DB_TYPE              | `"sqlite"`                   | Type of database used.                          |
| DB_PATH              | `"../src/database/chatdb.sqlite"` | Path to the SQLite database file.               |
| AUTH_MODE            | `"direct"`                   | Authentication mode used.                       |
| TOKEN_SECRET         | `"chat-secret-change-me-in-production"` | Secret for signing/verifying JWTs.              |

## Detailed Explanation

### SERVICE_URL
The base URL where the service is hosted. Ensure this is set correctly in production.

### PORT
The port on which the service listens. Default is `4000`.

### DB_TYPE and DB_PATH
Defines the database type and path. For SQLite, use the default path; for other databases, configure `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASS`.

### AUTH_MODE
Specifies the authentication method. Refer to the [Authentication](./authentication.md) file for details.