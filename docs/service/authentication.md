# Authentication

The AIOChatWC service supports multiple authentication methods to secure chat interactions. Choose the method that best fits your application:

## Quick Setup (Development)

For quick development setup, simply provide a `user_id` to the chat component:

```html
<chat-widget user_id="123"></chat-widget>
```

Or programmatically:

```javascript
import { initChatWidget } from 'aio-chat-wc';

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
then you must provide user_id in a response

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

Need more help? Check the [GitHub repository](https://github.com/mamqek/Vue-Chat) for issues or to create a new one.