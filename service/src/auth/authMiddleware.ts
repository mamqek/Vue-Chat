// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { Algorithm } from 'jsonwebtoken';
import { asyncLocalStorage } from './context';
import { getConfigVariable } from '../config/config';


export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {

    // Skip authentication for login route.
    if (req.path === '/login') {
        return next();
    }
    
    // 1. Check if developer routes request through his authenticated route 
    if (getConfigVariable('HOST') != "0.0.0.0" ) {
        if (req.body && req.body.user) {
            req.user = req.body.user;
    
            asyncLocalStorage.run({ user: req.user }, () => {
                return next();
            });
            return;
        } else {
            return res.status(500).json({ error: 'HOST was changed, meaning authenticated route approach was chosen, but user isnt provided in body' });
        }
    }

    let token;

    // 1. Check if there's a JWT in the Authorization header.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    // 2. If no JWT in header, check for a session cookie.
    if (!token && req.cookies && req.cookies[getConfigVariable('TOKEN_NAME')]) {
        token = req.cookies[getConfigVariable('TOKEN_NAME')];
    }
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    if (isJWT(token)) {
        try {
            const decoded = jwt.verify(
                token,
                getConfigVariable('TOKEN_SECRET'),
                { algorithms: [ getConfigVariable("JWT_ALGORITHM") as Algorithm ] }
            );     
            
            // If the token only contains a session ID (e.g., { id: 'session123' } ), then look up the full user.
            if (typeof decoded === 'object' && decoded && Object.keys(decoded).length === 1 && decoded.id) {
                const lookupFn = getConfigVariable('sessionLookup');
                req.user = await lookupFn(decoded.id as string);
            } else {
                // Otherwise, assume the token contains full user information.
                req.user = decoded as any;
            }
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token', details: error });
        }
    } else {
        // Assume token is opaque and use lookup function directly.
        const lookupFn = getConfigVariable('sessionLookup');
        req.user = await lookupFn(token);
    }

    // Set up AsyncLocalStorage context with the user.
    asyncLocalStorage.run({ user: req.user }, () => {
        next();
    });

}

function isJWT(token: string): boolean {
  return token.split('.').length === 3;
}