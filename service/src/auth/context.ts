// context.ts
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction, RequestHandler } from 'express';

interface RequestContext {
  user: any;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getAuthUser() {
    const store = asyncLocalStorage.getStore();
    if (!store || !store.user) {
        throw new Error("Authenticated user is not set.");
    }
    return store.user;
}

export function withContext(fn: RequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const store = asyncLocalStorage.getStore();
        if (!store) {
            console.error('AsyncLocalStorage context lost.');
            return res.status(401).json({ error: 'Auth context lost' });
        }
        asyncLocalStorage.run(store, () => {
            fn(req, res, (err?: any) => {
                // Make sure that the next callback is also run in the same context.
                asyncLocalStorage.run(store, () => next(err));
            });
        });
    };
}