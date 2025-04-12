# Database Connection

The Vue-Chat service uses a database to store chat-related data. Follow these steps to configure the database:

## Configuration

Set the following variables in the service configuration:

| Variable Name | Default Value                  | Description                                      |
|---------------|--------------------------------|--------------------------------------------------|
| DB_TYPE       | `"sqlite"`                   | Type of database used.                          |
| DB_PATH       | `"../src/database/chatdb.sqlite"` | Path to the SQLite database file.               |
| DB_NAME       | `"chatdb"`                   | Name of the database.                           |
| DB_HOST       | `""`                         | Host for non-SQLite databases.                  |
| DB_PORT       | `undefined`                   | Port for non-SQLite databases.                  |
| DB_USER       | `""`                         | Username for non-SQLite databases.              |
| DB_PASS       | `""`                         | Password for non-SQLite databases.              |

## User Entity Customization

To customize the user entity, provide a mapping to the `user_mapping` configuration variable. Example:

```javascript
module.exports = {
  user_mapping: {
    full_name: { name: 'username', default: 'Guest' },
    avatar: { name: 'profile_picture', isNullable: true },
    bio: { name: 'description', isNullable: true }
  }
};
```

## Migrations

Run migrations to apply database schema changes:

```bash
npm run migrations
```

To revert the last migration:

```bash
npm run migrations:revert
```

Alternatively, use the exported functions:

```javascript
import { handleMigrations, revertMigrations } from './src/database/migrationUtils';
export { handleMigrations, revertMigrations };
```