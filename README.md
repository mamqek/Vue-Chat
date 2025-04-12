# Start

## Config 

In development you might use localhost:4000, but in production, you’d set SERVICE_URL to something like https://website.com (if using a reverse proxy) or https://website.com:4000 (if exposing the port directly).

setConfig({
  User: {
    entity: MyCustomUser, // Or omit if they are only changing the mapping on the default entity.
    field_mapping: {
      full_name: 'username', // Map the expected full_name to their "username" column.
      avatar: 'avatar',      // Keep as is if names match.
      bio: 'bio',            // Keep as is.
    }
  }
});

| Variable Name       | Default Value                              | Description                                      | Possible Values                                  |
|---------------------|------------------------------------------|--------------------------------------------------|------------------------------------------------|
| production          | `__dirname.includes('dist')`            | Indicates if the environment is production.      | `true`, `false`                                 |
| PORT                | `4000`                                   | The port the service listens on.                | Any valid port number (e.g., `3000`, `8080`)    |
| SERVICE_URL         | `"http://localhost:4000"`              | External URL for the service.                   | Any valid URL                                   |
| UPLOAD_DIR          | `"uploads"`                            | Directory for file uploads.                     | Any valid directory path                        |
| UPLOAD_URL          | `"uploads"`                            | URL path for accessing uploads.                 | Any valid URL path                              |
| CORS_ORIGIN         | `["http://localhost:5174", "http://localhost:5173"]` | Allowed origins for CORS requests.             | Array of valid URLs                             |
| user_filter         | `{}`                                     | Filter criteria for users.                      | JSON object or stringified JSON                |
| DB_PATH             | `"../src/database/chatdb.sqlite"`      | Path to the SQLite database file.               | Any valid file path                             |
| DB_TYPE             | `"sqlite"`                             | Type of database used.                          | `"sqlite"`, `"mysql"`, `"postgres"`       |
| DB_NAME             | `"chatdb"`                             | Name of the database.                           | Any valid database name                         |
| DB_HOST             | `""`                                   | Host for non-SQLite databases.                  | Any valid hostname or IP address               |
| DB_PORT             | `undefined`                              | Port for non-SQLite databases.                  | Any valid port number                           |
| DB_USER             | `""`                                   | Username for non-SQLite databases.              | Any valid username                              |
| DB_PASS             | `""`                                   | Password for non-SQLite databases.              | Any valid password                              |
| synchronize         | `false`                                  | Automatically create database schema.           | `true`, `false`                                 |
| logging             | `false`                                  | Enable TypeORM logging.                         | `true`, `false`, or logging options             |
| HOST                | `"0.0.0.0"`                            | Network interface to bind to.                   | `"127.0.0.1"`, `"0.0.0.0"`                  |
| user_table_name     | `"users"`                              | Name of the user table in the database.         | Any valid table name                            |
| AUTH_MODE           | `"direct"`                             | Authentication mode used.                       | `"direct"`, `"auth-endpoint"`, `"jwt"`, `"custom"`, `"proxy"` |
| AUTH_ENDPOINT_URL   | `""`                                   | URL for auth endpoint authentication.           | Any valid URL                                   |
| TOKEN_NAME          | `"chat_token"`                         | Name of the token for authentication.           | Any valid token name                            |
| TOKEN_SECRET        | `"chat-secret-change-me-in-production"`| Secret for signing/verifying JWTs.              | Any valid string                                |
| JWT_ALGORITHM       | `"HS256"`                              | Algorithm used for JWT.                         | `"HS256"`, `"RS256"`, etc.                  |
| JWT_USER_ID_FIELD   | `"id"`                                 | Field in JWT payload containing user ID.        | Any valid field name                            |
| TRUSTED_PROXIES     | `[]`                                     | List of trusted proxy hostnames.                | Array of valid hostnames                        |
| PROXY_USER_ID_SOURCE| `"body"`                               | Source of user ID in proxy authentication.      | `"query"`, `"body"`, `"headers"`          |
| PROXY_USER_ID_FIELD | `"user_id"`                            | Field name for user ID in proxy authentication. | Any valid field name                            |

## User data

Chat service connects to the database of your project and retrieves required for chat user information (also see in User entity service\src\entities\User.ts)
- full_name (user name to be displayed)
- avatar (path to users profile picture)
- bio (~1 sentence of user description)

To do so, chat service requires id of the user which uses the chat. 
There are several ways to pass it: 



### Pass as attribute to web component

You can pass user-id as attribute to the component

<chat-widget 
    user-id="2"
</chat-widget>

Just like that web component will retrieve user information from connected DB. 
Package authenticates requests to service via JWT. It is advised to change config attributes from default values: 
- TOKEN_SECRET - your secret which is used for encoding
- JWT_ALGORITHM - algorithm used for encoding (default is HS256), not really necessary to change

### Pass requests through your authenticated route 

You can setup an authenticated route like "chat/*". It will receive all requests from web component and pass them to chat service. This approach counts on that your route will provide user object in the body of request when passing it. It will also omit service's authentication as it counts on your backend handling it. 

You need to set these properties in config:

- HOST - set it to '127.0.0.1' to only allow requests from the same machine (if your backed and chat service are run on the same server)
- SERVICE_URL - set it to url of your project + route you have set up f.e your project url is "https://website.com" and route is "chat/*", then set it to "https://website.com/chat"


### Connect service to your authentication system

Many frameworks store user information in session or cookies to access authenticated user in easy manner. You can choose method your project uses and configure service so it extracts user info from the same source.

#### JWT 
if your project uses JWT for authentication, from which user_id can be extracted. Package supports when this token is HttpOnly Cookie or if its stored in localStorage on the client. For now package doesnt support encryption (JWE) or Paseto. 

You need to set these properties in config:

- TOKEN_NAME - how your cookie is named or its attribute name in localStorage
- TOKEN_SECRET - your secret which is used for encoding
- JWT_ALGORITHM - algorithm used for encoding (default is HS256)

#### Session based authentication
If your project uses session based authentication, if you use f.e Laravel, Ruby on Rails, Django, Express, ASP.NET Core

You need to set these properties in config:

- TOKEN_NAME - how your cookie is named or its attribute name in localStorage
- sessionLookup - provide function which validates token and returns object with property id which is id of the authenticated user. Usually in such systems user info is retrieved by accession session table in database, depends on framework or your custom implementation

If the token used by session based autentication is also JWT, this approach can be used together with JWT approach with assumption that "id" property of JWT holds session token.

TODO: provide an example for laravel 

# vue-chat

  "scripts": {
    // 1. Development mode: run both the Node service (in watch mode) and Vite dev server in parallel.
    "dev": "concurrently \"npm:dev:service\" \"npm:dev:web\"",

    // 1a. Dev script for the service alone.
    "dev:service": "tsnd --respawn --transpile-only service/src/index.ts",

    // 1b. Dev script for the web component alone.
    "dev:web": "vite",

    // 2. Build everything: compile service with tsc, build web component with Vite.
    "build": "npm run build:service && npm run build:web",

    "build:service": "tsc --project service/tsconfig.json",
    "build:web": "vite build",

    // 3. Start the compiled Node service (and serve or proxy the built web if needed).
    "start": "node service/dist/index.js"
  },


  ## Service override 

  2. Advanced Developer’s Customization
Now, an advanced developer using your package can import the ChatService class, create a subclass that overrides the desired method(s), and then replace the default instance.

For example:

ts
Copy
// customChatService.ts in the consuming project
import { ChatService } from 'your-chat-package/src/chatService';

class CustomChatService extends ChatService {
  async getAdvisors(authUserId: number): Promise<any[]> {
    // Custom logic: for example, filter advisors by a custom field.
    const userRepository = AppDataSource.getRepository(User);
    // Suppose the developer wants advisors who have a custom flag "isAdvisor" set to true.
    const advisors = await userRepository.find({ where: { isAdvisor: true } });
    for (const advisor of advisors) {
      const chatRepository = AppDataSource.getRepository(Chat);
      const count = await chatRepository.createQueryBuilder("chat")
        .where("chat.user1_id = :authUserId AND chat.user2_id = :advisorId", { authUserId, advisorId: advisor.id })
        .orWhere("chat.user1_id = :advisorId AND chat.user2_id = :authUserId", { authUserId, advisorId: advisor.id })
        .getCount();
      (advisor as any).has_chat = count > 0;
    }
    return advisors;
  }
}

export default new CustomChatService();
Then, in the consuming application, they can replace your default instance with their custom one:

ts
Copy
// In the consuming app's initialization code:
import { setChatServiceInstance } from 'your-chat-package/src/chatService';
import customChatService from './customChatService';

// Override the default ChatService instance.
setChatServiceInstance(customChatService);

// Now, when the web component uses the ChatService (via getChatServiceInstance),
// it will use the custom implementation.


or just to change fileter condiotn provide it to a web component like 

<chat-widget 
    auth-user='{"id":123,"name":"Alice"}' 
    advisor-filter='{"customProperty": "value"}'>
</chat-widget>

then it will be used as a filter on Users as userFilter
        const otherChatters = await userRepository.find({ where: this.userFilter || {} });    


## Database connection and driver 

// Determine the database type from an environment variable,
// defaulting to 'sqlite' for testing purposes.
const dbType = process.env.DB_TYPE || 'sqlite';

// Configure connection options.
// If using SQLite, the database file will be placed in the service directory.
const dataSourceOptions = {
  type: dbType as any, // Cast as any to bypass type conflicts when using env variables.
  database: dbType === 'sqlite' ? './chatdb.sqlite' : process.env.DB_NAME || 'chatdb',
  host: process.env.DB_HOST,     // For other DB types (e.g., postgres, mysql)
  port: process.env.DB_PORT ? +process.env.DB_PORT : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  entities: [Chat, ChatMessage, ChatMessageStatus, User],
  synchronize: true,  // Set to false in production environments.
  logging: false,
};


    "peerDependencies": {
        "mysql2": "^3.13.0",
        "pg": "^8.7.0"
    },





npx migrations





# **Overview**

The vue-chat package provides an embeddable chat widget web component and bundled with a service to handle chat logic. 

---
# **Installation**

Install the package via npm:

```
npm install vue-chat
```

Also you need Vue.js installed in your project 

```
npm install vue
```
## Quick setup (if you don't care for configuration just yet)

### Install the package

```
npm install vue-chat
```

and Vue.js (if not yet installed)

```
npm install vue
```

## Define the component 

Create a JS file f.e chat.js and import package into it 

```
import "vue-chat"
```

Import that JS file to your HTML file 

Add HTML element where you want it to be placed 

```
<chat-widget 
    user_id="1" 
</chat-widget>
```

Provide user_id of user you want to be chatting from  


---
# Web Component 

Web component supports two ways to be created: 
1. Using the `<chat-widget>` HTML element.
2. Using the [initChatWidget](vscode-file://vscode-app/c:/Users/mukha/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) function programmatically.
## **Usage**

### **1. Using the `<chat-widget>` HTML Element**

You can embed the chat widget directly in your HTML by adding the `<chat-widget>` element and providing the required attributes.

#### Example:

In some JS file that you load you need to import the package 
```
import "vue-chat"
```

After that you can declare HTML element anywhere where JS file was loaded. 
```
<chat-widget 
    user_id="123" 
    service_url="https://your-backend.com">
</chat-widget>
```

for details of attributes passed to the element look in [[#Configuration]]

---
### **2. Using the initChatWidget() Function**

You can also omit placing custom HTML element and initialize the chat widget programmatically using the initChatWidget function and providing selector to a container where component should be placed.
#### Example:

```
import { initChatWidget } from 'vue-chat';

initChatWidget({
    user_id: 123,
    service_url: 'https://your-backend.com',
    container: document.querySelector('#chat-container'), 
});
```

## Configuration

As you have seen in Usage examples you can provide some configuration variables to the component. 

| Option      | Description                                                                 | Default Value           |
| ----------- | --------------------------------------------------------------------------- | ----------------------- |
| service_url | The base URL of the chat service.                                           | "http://localhost:4000" |
| user_id     | The ID of the authenticated user.                                           | null                    |
| token       | The name of the JWT token used by service                                   | "chat_token"            |
| container   | (only for initChatWidget) The DOM element where the widget will be mounted. | null                    |
### Service URL
It is simply the URL to which chat's front-end sends requests to. By this URL chat's service should be available. 

In development you can keep the default value of localhost:4000, but in production, you’d set SERVICE_URL to something like https://website.com (if using a reverse proxy) or https://website.com:4000 (if exposing the port directly).

### User Id 

For simple setup you can provide user_id to either HTML element or initChatWidget() and no other steps are required. However, if you don't want to expose user_id via HTML, you can look into Token setup 

### Token 

This setting is tightly connected with service's authentication process





# Service 

Service provides all functionality required for chat such as database, chat logic, authorization. It is highly configurable and can be adjusted to meet any project needs. 

## Configuration 

| Variable Name        | Default Value                                        | Allowed  Values | Description                                     |
| -------------------- | ---------------------------------------------------- | --------------- | ----------------------------------------------- |
| production           | `__dirname.includes('dist')`                         |                 | Indicates if the environment is production.     |
| PORT                 | `4000`                                               |                 | The port the service listens on.                |
| SERVICE_URL          | `"http://localhost:4000"`                            |                 | External URL for the service.                   |
| UPLOAD_DIR           | `"uploads"`                                          |                 | Directory for file uploads.                     |
| UPLOAD_URL           | `"uploads"`                                          |                 | URL path for accessing uploads.                 |
| CORS_ORIGIN          | `["http://localhost:5174", "http://localhost:5173"]` |                 | Allowed origins for CORS requests.              |
| user_filter          | `{}`                                                 |                 | Filter criteria for users.                      |
| DB_PATH              | `"../src/database/chatdb.sqlite"`                    |                 | Path to the SQLite database file.               |
| DB_TYPE              | `"sqlite"`                                           |                 | Type of database used.                          |
| DB_NAME              | `"chatdb"`                                           |                 | Name of the database.                           |
| DB_HOST              | `""`                                                 |                 | Host for non-SQLite databases.                  |
| DB_PORT              | `undefined`                                          |                 | Port for non-SQLite databases.                  |
| DB_USER              | `""`                                                 |                 | Username for non-SQLite databases.              |
| DB_PASS              | `""`                                                 |                 | Password for non-SQLite databases.              |
| synchronize          | `false`                                              |                 | Automatically create database schema.           |
| logging              | `false`                                              |                 | Enable TypeORM logging.                         |
| HOST                 | `"0.0.0.0"`                                          |                 | Network interface to bind to.                   |
| user_table_name      | `"users"`                                            |                 | Name of the user table in the database.         |
| AUTH_MODE            | `"direct"`                                           |                 | Authentication mode used.                       |
| AUTH_ENDPOINT_URL    | `""`                                                 |                 | URL for auth endpoint authentication.           |
| TOKEN_NAME           | `"chat_token"`                                       |                 | Name of the token for authentication.           |
| TOKEN_SECRET         | `"chat-secret-change-me-in-production"`              |                 | Secret for signing/verifying JWTs.              |
| JWT_ALGORITHM        | `"HS256"`                                            |                 | Algorithm used for JWT.                         |
| JWT_USER_ID_FIELD    | `"id"`                                               |                 | Field in JWT payload containing user ID.        |
| TRUSTED_PROXIES      | `[]`                                                 |                 | List of trusted proxy hostnames.                |
| PROXY_USER_ID_SOURCE | `"body"`                                             |                 | Source of user ID in proxy authentication.      |
| PROXY_USER_ID_FIELD  | `"user_id"`                                          |                 | Field name for user ID in proxy authentication. |



# Vue-Chat Authentication Documentation

## Quick Setup (Development)

For quick development setup, simply provide a `user_id` to the chat component:

```html
<chat-widget user_id="123"></chat-widget>
```

Or programmatically:

```javascript
import { initChatWidget } from 'vue-chat';

initChatWidget({
  container: document.querySelector('#chat-container'),
  user_id: "123"
});
```

> ⚠️ **Warning**: This direct method is not secure for production environments. For production applications, use one of the [secure authentication methods](#authentication-methods) described below.

## Authentication Methods

Choose the authentication method that best fits your application security needs and complexity of setup:

| Method        | Best For               | Security Level | Setup Complexity | Requirements                             |
| ------------- | ---------------------- | -------------- | ---------------- | ---------------------------------------- |
| Direct        | Quick prototyping      | ⭐☆☆☆☆          | ⭐☆☆☆☆            | None - works out of the box              |
| Auth Endpoint | Simple applications    | ⭐⭐⭐☆☆          | ⭐⭐☆☆☆            | Backend endpoint to verify users         |
| JWT           | JWT-based applications | ⭐⭐⭐⭐☆          | ⭐☆☆☆☆            | Your app already uses JWT authentication |
| Proxy         | Robust applications    | ⭐⭐⭐⭐⭐          | ⭐⭐⭐☆☆            | Control over backend routing             |
| Custom        | Specialized auth needs | ⭐⭐⭐⭐☆          | ⭐⭐⭐⭐☆            | Custom authentication system             |
## Detailed Authentication Guide

### Direct Authentication

**Configuration:** `AUTH_MODE: 'direct'`

The simplest authentication method where the user ID is provided directly to the component.

#### How it works:

1. You provide a `user_id` to the component
2. The package creates a JWT token for subsequent requests
3. The token is stored as a cookie

#### Implementation:

```html
<chat-widget user_id="123"></chat-widget>
```

Or in JavaScript:

```javascript
initChatWidget({
  user_id: "123",
  container: document.querySelector('#chat-container')
});
```

#### Server Configuration:

```javascript
module.exports = {
  AUTH_MODE: 'direct',
  TOKEN_SECRET: 'your-secure-secret-key', // Change this in production!
  TOKEN_NAME: 'chat_token'
}
```

> ⚠️ **Security Warning**: This method exposes the user ID in your HTML. Use only for development or internal applications where security is not critical.

### Auth Endpoint Authentication

**Configuration:** `AUTH_MODE: 'auth-endpoint'`

A simple but secure method that verifies users through your own authentication endpoint.

#### How it works:
1. You create a simple endpoint in your backend that verifies user authentication 
2. The chat service calls this endpoint, optionally passing the user_id if provided 
3. Your endpoint returns 200 if authorized, with an optional user_id in the response 
4. This prevents unauthorized users from accessing chat data

#### Implementation:

On the server, set your configuration:

```javascript
module.exports = {
  AUTH_MODE: 'auth-endpoint',
  AUTH_ENDPOINT_URL: 'https://your-app.com/api/verify-chat-user'
}
```

Create an authentication endpoint in your backend:

```javascript
// Express.js example
app.get('/api/verify-chat-user', (req, res) => {
  const userId = req.query.user_id;
  
  // Check if user is authorized based on your authentication system
  // This could check session data, tokens, or database records
  if (isUserAuthorized(userId)) {
    return res.status(200).send('OK');
  } else {
    return res.status(401).send('Unauthorized');
  }
});
```

In your client code (no changes needed):

```html
<chat-widget user_id="123"></chat-widget>
```

or if not passing user_id to the component directly 

```html
<chat-widget></chat-widget>
```

```javascript
// Express.js example
app.get('/api/verify-chat-user', (req, res) => {
  // Check if user is authenticated in your system
  if (!req.session.isAuthenticated) {
    return res.status(401).send('Unauthorized');
  }
  
  // Return 200 OK with the authenticated user's ID
  return res.status(200).json({
    user_id: req.session.userId
  });
});
```


#### Security Considerations:

- Your authentication endpoint should properly validate that the current session/user matches the requested user_id
- The endpoint should return 401 for any unauthorized requests
- Consider adding rate limiting to the endpoint to prevent abuse
### JWT Authentication

**Configuration:** `AUTH_MODE: 'jwt'`

Use your existing JWT authentication system with the chat package.

#### How it works:

1. Your application authenticates users and creates JWTs
2. The chat component uses these tokens to authenticate
3. The package verifies the JWT and extracts user_id based by the field provided in config

#### Implementation:

```html
<chat-widget></chat-widget>
```

The component will automatically use your authentication token.

#### Server Configuration:

```javascript
module.exports = {
  AUTH_MODE: 'jwt',
  TOKEN_NAME: 'your_auth_token_name', // Cookie/header name for your JWT
  TOKEN_SECRET: 'your-jwt-secret-key', // Must match your application's JWT secret
  JWT_ALGORITHM: 'HS256', // Must match your JWT algorithm
  JWT_USER_ID_FIELD: 'userId' // Field in JWT payload containing the user ID
}
```

### Proxy Authentication

**Configuration:** `AUTH_MODE: 'proxy'`

Secure method where all chat requests pass through your authenticated backend.

#### How it works:

1. Your application creates an authenticated proxy route
2. The chat component sends requests to this route
3. Your proxy adds user information before forwarding to the chat service
4. The chat service verifies the request comes from a trusted source

#### Implementation:

In your client code:

```html
<chat-widget service_url="/api/chat-proxy"></chat-widget>
```

Create a proxy endpoint in your backend:

```javascript
// Express.js example
app.use('/api/chat-proxy', authenticate, (req, res, next) => {
  // Add user information to request
  req.body.user_id = req.user.id;
  
  // Add proxy authentication header
  req.headers['x-proxy-auth'] = process.env.PROXY_SECRET;
  
  // Forward to chat service
  proxy.web(req, res, { 
    target: 'http://localhost:4000',
    changeOrigin: true
  });
});
```

#### Server Configuration:

```javascript
module.exports = {
  AUTH_MODE: 'proxy',
  PROXY_SECRET: 'shared-secret-between-app-and-service', // Secret key for proxy auth
  TRUSTED_PROXIES: ['your-app-domain.com'], // Domains allowed to proxy
  PROXY_USER_ID_SOURCE: 'body', // Where to look for user_id (body, query, headers)
  PROXY_USER_ID_FIELD: 'user_id' // Field name containing user ID
}
```

### Custom Authentication

**Configuration:** `AUTH_MODE: 'custom'`

Maximum flexibility for specialized authentication systems.

#### How it works:

1. You provide a custom function that authenticates requests
2. This function can access any part of the request (cookies, headers, etc.)
3. The function returns a user object with at least an `id` property

#### Implementation:

```html
<chat-widget></chat-widget>
```

#### Server Configuration:

```javascript
module.exports = {
  AUTH_MODE: 'custom',
  customAuthFunction: async (req) => {
    // Example: Session-based authentication
    const sessionId = req.cookies.sessionId;
    
    // Look up user from session (your implementation)
    const user = await sessionStore.getUserBySessionId(sessionId);
    
    if (!user) {
      throw new Error('Invalid session');
    }
    
    return { 
      id: user.id,
    };
  }
}
```

## Best Practices

1. **Production Security**: Always use JWT, Proxy, or Custom authentication in production.
2. **Secret Management**: Store secrets securely using environment variables.
3. **HTTPS**: Use HTTPS in production to protect authentication tokens.
4. **Token Expiration**: Set reasonable expiration times for authentication tokens.
5. **Minimal Data**: Only include necessary user information in authentication tokens.

## Troubleshooting

**Authentication Errors**: If you see "Authentication failed" errors:

- Check that your secrets and token names match between your app and the chat service
- Verify cookies are being sent properly (check same-origin policy)
- For proxy auth, ensure your domain is in the TRUSTED_PROXIES list

**CORS Issues**: If you encounter CORS errors with proxy authentication:

- Configure CORS on both your proxy endpoint and the chat service
- Ensure the `SERVICE_URL` configuration points to your proxy endpoint

Need more help? Check the [GitHub repository](https://github.com/yourusername/vue-chat) for issues or to create a new one.



# Authentication Middleware Documentation

The authentication middleware supports multiple authentication modes to accommodate various application requirements. This document provides configuration examples and requirements for each supported authentication method.

## Overview

The `authMiddleware` function verifies user authentication before allowing access to protected routes. It supports five authentication modes:

1. **Direct Authentication** (default) - JWT-based authentication
2. **JWT Authentication** - Enhanced JWT authentication with configurable fields
3. **Proxy Authentication** - For requests through an authenticated proxy
4. **Custom Authentication** - Using your own authentication function
5. **Auth Endpoint Authentication** - Delegating authentication to an external endpoint

## Configuration Examples

### Direct Authentication

JWT-based authentication where tokens are automatically generated on login.

```javascript
// Configuration
{
  AUTH_MODE: 'direct',
  TOKEN_SECRET: 'your-secret-key',
  TOKEN_NAME: 'auth_token',
  JWT_ALGORITHM: 'HS256'
}
```

**Requirements:**

- No action required from users - JWTs are created and attached by the service during login
- The middleware will check for the JWT in:
    1. `Authorization` header (format: `Bearer <token>`)
    2. Cookie with name matching `TOKEN_NAME` configuration

### JWT Authentication

More configurable JWT authentication with custom field mapping.

```javascript
// Configuration
{
  AUTH_MODE: 'jwt',
  TOKEN_SECRET: 'jwt_secret',
  TOKEN_NAME: 'jwt_token',
  JWT_ALGORITHM: 'HS256',
  JWT_USER_ID_FIELD: 'sub'  // Extract user ID from this field
}
```

**Requirements:**

- JWT must be provided in one of:
    1. `Authorization` header (format: `Bearer <token>`)
    2. Cookie with name matching `TOKEN_NAME` configuration
    3. Query parameter with name matching `TOKEN_NAME` configuration
- The JWT must contain the field specified in `JWT_USER_ID_FIELD` for user identification

### Proxy Authentication

For applications where authentication is handled by a trusted proxy or frontend.

```javascript
// Configuration
{
  AUTH_MODE: 'proxy',
  PROXY_SECRET: 'proxy_secret_123',
  TRUSTED_PROXIES: ['trusted-app.com', 'admin.example.org'],
  PROXY_USER_ID_FIELD: 'user_id',
  PROXY_USER_ID_SOURCE: 'body'  // Can be 'body', 'query', or 'headers'
}
```

**Requirements:**

- Request must come from an origin listed in `TRUSTED_PROXIES`
- Request must include `x-proxy-auth` header matching the `PROXY_SECRET`
- User ID must be provided in the location specified by `PROXY_USER_ID_SOURCE`:
    - If 'body': Request body must contain field matching `PROXY_USER_ID_FIELD`
    - If 'query': URL query parameters must contain key matching `PROXY_USER_ID_FIELD`
    - If 'headers': Request headers must contain field matching `PROXY_USER_ID_FIELD`
- Legacy support: If a `user` object is provided in the body with an `id` field, it will be used automatically

### Custom Authentication

For implementing your own authentication logic.

```javascript
// Configuration
{
  AUTH_MODE: 'custom',
  customAuthFunction: async (req) => {
    // Your custom authentication logic
    // Must return an object with at least an 'id' field
    // Or throw an error if authentication fails
    
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) throw new Error('No API key provided');
    
    // Example: validate against your database
    const user = await validateApiKey(apiKey);
    if (!user) throw new Error('Invalid API key');
    
    return { id: user.id, role: user.role }; // Must include id field
  }
}
```

**Requirements:**

- The `customAuthFunction` must be implemented and provided in configuration
- Function must return a user object with at least an `id` field
- Function must throw an error if authentication fails

### Auth Endpoint Authentication

Delegates authentication to an external service via HTTP.

```javascript
// Configuration
{
  AUTH_MODE: 'auth-endpoint',
  AUTH_ENDPOINT_URL: 'https://example.com/api/verify-user'
}
```

**Requirements:**

- User ID can be provided in request via `user_id` query parameter
- If user's origin matches the auth endpoint's domain, cookies will be forwarded for session-based authentication
- The external endpoint must:
    1. Return HTTP 200 for authenticated requests
    2. Return a non-200 status for unauthenticated requests
    3. Provide user information in JSON response
    4. Include `user_id` in the response if not provided in the original request

## Special Path Handling

- `/login` path is exempt from authentication
- `/user` path retrieves current user information

## Usage in Context

The middleware stores the authenticated user in the request object and in the asyncLocalStorage context. This makes user information available to downstream request handlers:

```javascript
// In request handlers, access user via:
const user = req.user;

// Or from asyncLocalStorage context:
import { asyncLocalStorage } from './middleware/context';
const store = asyncLocalStorage.getStore();
const user = store.user;
```