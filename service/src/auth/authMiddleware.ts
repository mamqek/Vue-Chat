// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { Algorithm } from 'jsonwebtoken';
import { asyncLocalStorage } from './context';
import { getConfigVariable } from '../config/config.server';
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Skip authentication for login route
    if (req.path === '/login') {
        return next();
    }

    // Get authentication mode from config
    const authMode = getConfigVariable('AUTH_MODE') || 'direct';
    
    try {
        switch(authMode) {
            case 'auth-endpoint':
                await handleAuthEndpointAuth(req);
                break;
            case 'proxy':
                await handleProxyAuth(req);
                break;
            case 'jwt':
                await handleJwtAuth(req);
                break;
            case 'custom':
                await handleCustomAuth(req);
                break;
            case 'direct':
            default:
                await handleDirectAuth(req);
                break;
        }

        if (!req.user || !req.user.id) {
            console.error('Authentication failed: No user ID found in request', req.user);
            throw new Error('Authentication failed: No user ID');
        }
        
        // If we got here without error, authentication succeeded
        // Set up AsyncLocalStorage context with the user
        asyncLocalStorage.run({ user: req.user }, () => {
            next();
        });
    } catch (error) {
        // Authentication failed
        return res.status(401).json({ 
            error: error || 'Authentication failed',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}

// PROXY AUTH: Used when requests come through host project's authenticated route
async function handleProxyAuth(req: AuthenticatedRequest) {
    const proxySecret = getConfigVariable('PROXY_SECRET');
    const trustedHosts = getConfigVariable('TRUSTED_PROXIES') || [];
    const userIdField = getConfigVariable('PROXY_USER_ID_FIELD') || 'user_id';
    
    // Check if request is coming from trusted source
    const requestOrigin = req.headers.origin || req.headers.referer || '';
    const hostname = new URL(requestOrigin).hostname;
    
    if (trustedHosts.length > 0 && !trustedHosts.includes(hostname)) {
        throw new Error('Request origin not trusted');
    }

    // Check for proxy authentication header if configured
    if (proxySecret) {
        const proxyAuth = req.headers['x-proxy-auth'];
        if (!proxyAuth || proxyAuth !== proxySecret) {
            throw new Error('Invalid proxy authentication');
        }
    }
    
    // Extract user ID from appropriate location (query, body, or headers)
    const userIdSource = getConfigVariable('PROXY_USER_ID_SOURCE') || 'body';
    let userId;
    
    if (userIdSource === 'query' && req.query[userIdField]) {
        userId = req.query[userIdField];
    } else if (userIdSource === 'body' && req.body && req.body[userIdField]) {
        userId = req.body[userIdField];
    } else if (userIdSource === 'headers' && req.headers[userIdField.toLowerCase()]) {
        userId = req.headers[userIdField.toLowerCase()];
    } else if (req.body && req.body.user && req.body.user.id) {
        // Legacy support for existing code
        userId = req.body.user.id;
    } else {
        throw new Error(`User ID not found in ${userIdSource}`);
    }
    
    req.user = { id: userId };
}

// JWT AUTH: Used when host project uses JWT
async function handleJwtAuth(req: AuthenticatedRequest) {
    let token;
    const tokenName = getConfigVariable('TOKEN_NAME');
    
    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    // Check cookies
    if (!token && req.cookies && req.cookies[tokenName]) {
        token = req.cookies[tokenName];
    }
    
    // Check query parameter (less secure, but convenient for testing)
    if (!token && req.query && req.query[tokenName]) {
        token = req.query[tokenName] as string;
    }
    
    if (!token) {
        throw new Error('No authentication token provided');
    }
    
    // Verify JWT
    const decoded = jwt.verify(
        token,
        getConfigVariable('TOKEN_SECRET'),
        { algorithms: [getConfigVariable("JWT_ALGORITHM") as Algorithm] }
    );

    // Map decoded JWT to user
    const userIdField = getConfigVariable('JWT_USER_ID_FIELD');
    
    if (typeof decoded === 'object' && decoded) {
        if (decoded[userIdField]) {
            req.user = { id: decoded[userIdField] };
        } else {
            // Use whole decoded object as user
            req.user = decoded;
        }
    } else {
        throw new Error('Invalid JWT format');
    }
}

// CUSTOM AUTH: Used when the developer provides their own authentication function
async function handleCustomAuth(req: any) {
    const authFunction = getConfigVariable('customAuthFunction');
    
    if (typeof authFunction !== 'function') {
        throw new Error('Custom authentication function not implemented');
    }
    
    try {
        // Pass the entire request to the custom function for maximum flexibility
        const user = await authFunction(req);
        
        if (!user || !user.id) {
            throw new Error('Custom authentication did not return a valid user');
        }
        
        req.user = user;
    } catch (error) {
        throw new Error(`Custom authentication failed: ${error}`);
    }
}

// DIRECT AUTH: Used when user_id is provided directly (simplest but least secure)
async function handleDirectAuth(req: AuthenticatedRequest) {
    // For the /user endpoint, we need to check if there's a token set during login
    if (req.path === '/user') {
        const token = req.cookies && req.cookies[getConfigVariable('TOKEN_NAME')];
        
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        try {
            // Verify the token
            const decoded = jwt.verify(
                token,
                getConfigVariable('TOKEN_SECRET'),
                { algorithms: [getConfigVariable("JWT_ALGORITHM") as Algorithm] }
            );
            
            req.user = typeof decoded === 'object' ? decoded : { id: decoded };
        } catch (error) {
            throw new Error('Invalid token');
        }
    } else {
        // For all other endpoints in direct mode, require authorization header or token
        await handleJwtAuth(req);
    }
}

// Add new handler function for auth endpoint
async function handleAuthEndpointAuth(req: AuthenticatedRequest) {
    // Get auth endpoint URL from config
    const authEndpoint = getConfigVariable('AUTH_ENDPOINT_URL');
    if (!authEndpoint) {
        throw new Error('AUTH_ENDPOINT_URL not configured');
    }
    
    // Optionally use user_id from request if provided
    const userId = req.body.user_id || req.query.user_id;
    
    // Forward authentication to developer's endpoint
    try {
        // Create URL with user_id as query parameter if provided
        const url = new URL(authEndpoint);
        if (userId) {
            url.searchParams.append('user_id', userId.toString());
        }
        
        // Make request to auth endpoint
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            // Forward cookies from original request if same domain
            credentials: new URL(authEndpoint).origin === req.headers.origin ? 'include' : 'same-origin'
        });
        
        // Check response status
        if (response.status !== 200) {
            throw new Error(`Authentication failed: Endpoint returned ${response.status}`);
        }
        
        // Get user_id from response if possible
        let authenticatedUserId = userId;
        
        try {
            const responseData = await response.json();
            if (responseData && responseData.user_id) {
                authenticatedUserId = responseData.user_id;
            }
        } catch (e) {
            throw new Error("Response wasn't JSON");
        }

        if (!authenticatedUserId) {
            throw new Error("User id wasn't provided initially or response didn't contain user_id");
        }
        
        // Set authenticated user
        req.user = { id: authenticatedUserId };
    } catch (error) {
        throw new Error(`Authentication endpoint error: ${error}`);
    }
}
