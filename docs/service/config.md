# Configuration

The Vue-Chat service is highly configurable. Below is a list of configuration variables grouped by their responsibilities:

| Group                | Variable Name        | Default Value                  | Description                                      |
|----------------------|----------------------|--------------------------------|--------------------------------------------------|
| **Environment**      | production          | `__dirname.includes('dist')`  | Indicates if the environment is production.      |
|                      | SERVICE_URL         | `"http://localhost:4000"`    | External URL for the service.                   |
|                      | PORT                | `4000`                        | The port the service listens on.                |
|                      | HOST                | `"0.0.0.0"`                   | The network interface to bind to.               |
|                      | CORS_ORIGIN         | `["http://localhost:5174", "http://localhost:5173"]` | Allowed origins for CORS requests.              |
| **Chat Service**     | UPLOAD_DIR          | `"uploads"`                   | Directory for storing uploaded files.           |
|                      | UPLOAD_URL          | `"uploads"`                   | URL path for accessing uploaded files.          |
|                      | user_filter         | `{}`                          | Filter criteria for users.                      |
| **Database**         | DB_TYPE             | `"sqlite"`                   | Type of database used.                          |
|                      | DB_PATH             | `"../src/database/chatdb.sqlite"` | Path to the SQLite database file.               |
|                      | DB_URL              | `undefined`                   | URL for non-SQLite databases.                   |
|                      | DB_NAME             | `"chatdb"`                   | Name of the database.                           |
|                      | DB_HOST             | `""`                         | Host for non-SQLite databases.                  |
|                      | DB_PORT             | `undefined`                   | Port for non-SQLite databases.                  |
|                      | DB_USER             | `""`                         | Username for non-SQLite databases.              |
|                      | DB_PASS             | `""`                         | Password for non-SQLite databases.              |
|                      | logging             | `false`                       | Enable TypeORM logging. [Reference](https://orkhan.gitbook.io/typeorm/docs/logging) |
| **User Entity**      | user_table_name     | `"users"`                    | Name of the user table in the database.         |
|                      | user_entity         | `DefaultUser`                 | The user entity class used by the service.      |
|                      | user_mapping        | `{ full_name, avatar, bio }`  | Field mapping for user properties.              |
| **Authentication**   | AUTH_MODE           | `"direct"`                    | Authentication mode used by the service.        |
|                      | AUTH_ENDPOINT_URL   | `""`                          | URL for the authentication endpoint.            |
|                      | TOKEN_NAME          | `"chat_token"`                | Name of the token used for authentication.      |
|                      | TOKEN_SECRET        | `"chat-secret-change-me-in-production"` | Secret key for signing/verifying JWTs.          |
|                      | JWT_ALGORITHM       | `"HS256"`                     | Algorithm used for signing JWTs.                |
|                      | JWT_USER_ID_FIELD   | `"id"`                        | Field in JWT payload that contains the user ID. |
|                      | TRUSTED_PROXIES     | `[]`                          | List of trusted hostnames for proxy authentication. |
|                      | PROXY_SECRET        | `undefined`                   | Shared secret for proxy authentication.         |
|                      | PROXY_USER_ID_SOURCE| `"body"`                      | Location of the user ID in proxy requests.      |
|                      | PROXY_USER_ID_FIELD | `"user_id"`                   | Field name containing the user ID in proxy requests. |
|                      | customAuthFunction  | `undefined`                   | Custom function for authentication logic.       |

## Detailed Explanation

### Environment
- **production**: Indicates if the environment is production. Defaults to `true` if the service is running from the `dist` directory.
- **SERVICE_URL**: The base URL where the service is hosted. Ensure this is set correctly in production.
- **PORT**: The port on which the service listens. Default is `4000`.
- **HOST**: The network interface to bind to. Use `"127.0.0.1"` to restrict access to local requests or `"0.0.0.0"` to accept external connections.
- **CORS_ORIGIN**: An array of allowed origins for CORS requests. This ensures that only specified domains can access the service.

### Chat Service
- **UPLOAD_DIR**: The directory where uploaded files are stored. Ensure this directory exists or is created during initialization.
- **UPLOAD_URL**: The URL path for accessing uploaded files. This should match the `UPLOAD_DIR` configuration.
- **user_filter**: Filter criteria for users, provided as a JSON object or stringified JSON. For example, `{"active": true, "role": "admin"}`.

### Database
- **DB_TYPE**: Defines the type of database used. Supported values are `"sqlite"`, `"mysql"`, and `"postgres"`.
- **DB_PATH**: Path to the SQLite database file. Used only when `DB_TYPE` is `"sqlite"`.
- **DB_URL**: The URL for connecting to non-SQLite databases. This is an alternative to specifying `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASS` individually.
- **DB_NAME**: Name of the database.
- **DB_HOST**: Host for non-SQLite databases.
- **DB_PORT**: Port for non-SQLite databases.
- **DB_USER**: Username for non-SQLite databases.
- **DB_PASS**: Password for non-SQLite databases.
- **logging**: Controls TypeORM logging. Refer to the [TypeORM Logging Documentation](https://orkhan.gitbook.io/typeorm/docs/logging) for syntax and possible values.

### User Entity
- **user_table_name**: Specifies the name of the user table in the database. Default is `"users"`.
- **user_entity**: Defines the user entity class used by the service. By default, it is set to `DefaultUser`.
- **user_mapping**: Allows customization of user field mappings. For example, you can map `full_name`, `avatar`, and `bio` to different database fields.

### Authentication
- **AUTH_MODE**: Specifies the authentication mode. Options include `direct`, `auth-endpoint`, `jwt`, `custom`, and `proxy`.
#### Auth Endpoint Mode
- **AUTH_ENDPOINT_URL**: The URL for the authentication endpoint. Used when `AUTH_MODE` is set to `auth-endpoint`.
#### JWT Mode
- **TOKEN_NAME**: The name of the token used for authentication. This is typically stored in cookies or headers.
- **TOKEN_SECRET**: The secret key used for signing and verifying JWTs. Change this value in production for security.
- **JWT_ALGORITHM**: The algorithm used for signing JWTs. Default is `"HS256"`.
- **JWT_USER_ID_FIELD**: The field in the JWT payload that contains the user ID. Default is `"id"`.
#### Proxy Mode
- **TRUSTED_PROXIES**: A list of trusted hostnames for proxy authentication. Requests from these hosts are considered secure.
- **PROXY_SECRET**: A shared secret used for proxy authentication. This ensures that only trusted proxies can forward requests.
- **PROXY_USER_ID_SOURCE**: Specifies where to find the user ID in proxy requests. Options include `"body"`, `"query"`, or `"headers"`.
- **PROXY_USER_ID_FIELD**: The field name containing the user ID in proxy requests. Default is `"user_id"`.
#### Custom Auth Mode
- **customAuthFunction**: A custom function for implementing authentication logic. It should return a user object with at least an `id` property.