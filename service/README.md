Database Drivers
This chat service uses TypeORM under the hood, but does not bundle any specific database drivers. To connect to your preferred database, install the corresponding driver:

PostgreSQL: npm install pg
MySQL: npm install mysql2
SQLite: npm install sqlite3 Then, update your DataSource configuration in dataSource.ts to use the correct type and connection options.