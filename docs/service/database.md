# Database Connection

The AIOChatWC service uses a database to store chat-related data. Overall service uses 4 tables: chats, chat_messages, chat_message_statuses, and users. The last one requires additional configuration to be compatible with existing databases. Follow these steps to configure the connection or creation of a new database:

1. Set appropriate config values to connect to your database or create a new one.
2. **Read the chapter about [User Entity Customization](#user-entity-customization) before running migrations on an existing database.**
3. Run migrations.
4. Try to start up the service. If errors appear or the database is incorrect, you can always revert migrations.

## Database Types

### SQLite

If you don't have a database in your project yet or don't want to connect chat to it, you can use the default SQLite database.
The only configuration available for it is to specify the path where you want the database file to be created, together with the name of the file at the end of the path.

```javascript
const myConfig = {
    DB_PATH: "relative/path/from/package.json with start command/databaseName.sqlite",
}
```
If not provided, it will be created inside the package directory.

### Other Database Providers

The package also supports connection to MySQL and PostgreSQL.
For them, configuration is more extensive as the package needs to connect to the database.

```javascript
const myConfig = {
    DB_TYPE: "mysql",
    DB_HOST: "127.0.0.1",
    DB_PORT: 3306,
    DB_NAME: "database_name",
    DB_USER: "username",
    DB_PASS: "password",
}
```

If you are accessing the database via URL, then use:

```javascript
const myConfig = {
    DB_TYPE: "mysql",
    DB_URL: "mysql://username:password@host:port/database",
}
```

## User Entity Customization

Service uses user objects for chat. If you decide to connect the service to your existing database, required fields in the User entity might differ. For that reason, you can provide a mapping to let the package know which attributes of your User entity to access when expecting its own.

The package has 3 required fields for the User entity:
- **full_name**: User name to be displayed.
- **avatar**: Path to the user's profile picture.
- **bio**: A short description of the user (~1 sentence), displayed under `full_name` in the chat window.

> ⚠️ **Note**: If you avoid providing a mapping, after running migrations, if these columns aren't present in the table, they will be added to it, which might result in duplicate data in the future.

The configuration variable `user_mapping` has 3 keys for each required field. This example shows the `user_mapping` structure as if in your database you store the displayed name in the column `username`, the user description in the column `description` instead of `bio`, but you do have an `avatar` column with the path to the image, so there is no need to override it.

Also, to avoid errors when adding new columns to a table with some data, the `default` or `isNullable` parameter might be required to resolve the empty state of the column in existing records.

> ⚠️ **Note**: If SQLite is used, you must provide a default value with specific syntax. First, wrap it with `''` and then wrap it with `""` as well, resulting in `"'name'"`. For MySQL or PostgreSQL, this isn't required.

```javascript
const myConfig = {
    user_mapping: {
        full_name: { 
            name: 'username', 
            default: "'Guest'" 
        },
        bio: { 
            name: 'description', 
            isNullable: true 
        }
    }
};
```

### Change 'users' Table Name

If you would rather have a separate table for chat users, you can change the table name via config:

```javascript
const myConfig = {
    user_table_name : "new_table_name"
}
```

Then you can keep `user_mapping` unchanged as it won't affect your existing 'users' table.

# Starting Up

After all the configurations are set, you can run migrations to add new tables and columns to your existing database or create a new one.

## Migrations

### Command

You can run migrations via a console command.

> ⚠️ **Note**: Currently, the only parameter you can pass to it is the path. So it's only useful for SQLite.

```bash
npx migrations --db-path path/to/dbFile/from/consoleDirectory
```

To revert the last migration:

```bash
npx migrations:revert --db-path path/to/dbFile/from/consoleDirectory
```
> ⚠️ **Note**: This command reverts only 1 migration, so to revert all changes, you need to run it 4 times.

### Function

Alternatively, use the exported functions:

```javascript
import { handleMigrations, revertMigrations } from './src/database/migrationUtils';
export { handleMigrations, revertMigrations };
```

Run them after starting the service like:

```javascript
startService(config)
.then(() => {
    handleMigrations();  // or revertMigrations()
})
.catch((err) => console.error("Failed to start chat service:", err));
```

This way, we ensure that migrations will inherit the config passed to the service.

## Configuration

Here are all config variables related to the database:

| Variable Name        | Default Value                  | Description                                      |
|----------------------|--------------------------------|--------------------------------------------------|
| DB_TYPE              | `"sqlite"`                   | Type of database used.                          |
| DB_PATH              | `"../src/database/chatdb.sqlite"` | Path to the SQLite database file.               |
| DB_URL               | `undefined`                   | URL for non-SQLite databases.                   |
| DB_NAME              | `"chatdb"`                   | Name of the database.                           |
| DB_HOST              | `""`                         | Host for non-SQLite databases.                  |
| DB_PORT              | `undefined`                   | Port for non-SQLite databases.                  |
| DB_USER              | `""`                         | Username for non-SQLite databases.              |
| DB_PASS              | `""`                         | Password for non-SQLite databases.              |
| logging              | `false`                       | Enable TypeORM logging. [Reference](https://orkhan.gitbook.io/typeorm/docs/logging) |
| user_table_name      | `"users"`                    | Name of the user table in the database.         |
| user_entity          | `DefaultUser`                 | The user entity class used by the service.      |
| user_mapping         | `{ full_name, avatar, bio }`  | Field mapping for user properties.              |
