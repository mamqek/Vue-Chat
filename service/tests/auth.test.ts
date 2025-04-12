// authMiddleware.test.ts
import { authMiddleware } from '../src/auth/authMiddleware';
import jwt from 'jsonwebtoken';
import { asyncLocalStorage } from '../src/auth/context';
import * as config from '../src/config/config.server';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../src/auth/context', () => ({
  asyncLocalStorage: {
    run: jest.fn((store, callback) => callback())
  }
}));
jest.mock('../src/config/config.server');

jest.mock('../../config/config.common.js', () => ({
  setCommonConfig: jest.fn(),
  getCommonConfig: jest.fn(() => ({
    SERVICE_URL: 'http://localhost:4000',
    TOKEN_NAME: 'chat_token',
    USER_ID: 123,
  })),
}));

// Mock fetch for auth endpoint tests
global.fetch = jest.fn();

describe('Auth Middleware Tests', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request, response, and next function
    req = {
      path: '/messages',
      headers: {},
      cookies: {},
      query: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
    
    // Default mock for getConfigVariable
    (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
      const defaults: Record<string, any> = {
        'AUTH_MODE': 'direct',
        'TOKEN_NAME': 'auth_token',
        'TOKEN_SECRET': 'test_secret',
        'JWT_ALGORITHM': 'HS256',
        'JWT_USER_ID_FIELD': 'id'
      };
      return defaults[key];
    });
  });



  describe('Login path handling', () => {
    it('should skip authentication for login path', async () => {
      req.path = '/login';
      
      await authMiddleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });



  describe('Direct Authentication', () => {
    beforeEach(() => {
      (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
        const defaults: Record<string, any> = {
          'AUTH_MODE': 'direct',
          'TOKEN_NAME': 'auth_token',
          'TOKEN_SECRET': 'test_secret',
          'JWT_ALGORITHM': 'HS256'
        };
        return defaults[key];
      });
    });

    it('should authenticate with valid JWT in Authorization header', async () => {
      const mockUser = { id: 'user123', name: 'Test User' };
      req.headers.authorization = 'Bearer valid_token';
      
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);
      
      await authMiddleware(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid_token', 
        'test_secret', 
        { algorithms: ['HS256'] }
      );
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(asyncLocalStorage.run).toHaveBeenCalledWith(
        { user: mockUser }, 
        expect.any(Function)
      );
    });

    it('should authenticate with valid JWT in cookie', async () => {
      const mockUser = { id: 'user123', name: 'Test User' };
      req.cookies = { auth_token: 'valid_cookie_token' };
      
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);
      
      await authMiddleware(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid_cookie_token', 
        'test_secret', 
        { algorithms: ['HS256'] }
      );
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', async () => {
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Error) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when JWT verification fails', async () => {
      req.headers.authorization = 'Bearer invalid_token';
      
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Error) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle /user path correctly by checking cookies', async () => {
      req.path = '/user';
      req.cookies = { auth_token: 'valid_user_token' };
      
      const mockUser = { id: 'user123', name: 'Test User' };
      (jwt.verify as jest.Mock).mockReturnValue(mockUser);
      
      await authMiddleware(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid_user_token', 
        'test_secret', 
        { algorithms: ['HS256'] }
      );
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });



  describe('JWT Authentication', () => {
    beforeEach(() => {
      (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
        const defaults: Record<string, any> = {
          'AUTH_MODE': 'jwt',
          'TOKEN_NAME': 'jwt_token',
          'TOKEN_SECRET': 'jwt_secret',
          'JWT_ALGORITHM': 'HS256',
          'JWT_USER_ID_FIELD': 'sub'
        };
        return defaults[key];
      });
    });

    it('should authenticate with JWT from Authorization header', async () => {
      req.headers.authorization = 'Bearer valid_jwt';
      
      const decodedJwt = { sub: 'user123', name: 'Test User' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedJwt);
      
      await authMiddleware(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid_jwt', 
        'jwt_secret', 
        { algorithms: ['HS256'] }
      );
      expect(req.user).toEqual({ id: 'user123' });
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate with JWT from cookie', async () => {
      req.cookies = { jwt_token: 'valid_cookie_jwt' };
      
      const decodedJwt = { sub: 'user123', name: 'Test User' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedJwt);
      
      await authMiddleware(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid_cookie_jwt', 
        'jwt_secret', 
        { algorithms: ['HS256'] }
      );
      expect(req.user).toEqual({ id: 'user123' });
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate with JWT from query parameter', async () => {
      req.query = { jwt_token: 'valid_query_jwt' };
      
      const decodedJwt = { sub: 'user123', name: 'Test User' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedJwt);
      
      await authMiddleware(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid_query_jwt', 
        'jwt_secret', 
        { algorithms: ['HS256'] }
      );
      expect(req.user).toEqual({ id: 'user123' });
      expect(next).toHaveBeenCalled();
    });

    it('should use the whole decoded object if user ID field not found', async () => {
        req.headers.authorization = 'Bearer jwt_no_sub';
        
        const decodedJwt = { id: 'user124', name: 'Test User' };
        (jwt.verify as jest.Mock).mockReturnValue(decodedJwt);

        // Update the configuration to use 'user_id' as the user ID field, which is incorrect
        (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
            const defaults: Record<string, any> = {
                'JWT_USER_ID_FIELD': 'user_id', // Use 'user_id' instead of 'id'
            };
            return defaults[key];
        });
      
      await authMiddleware(req, res, next);
      
      expect(req.user).toEqual(decodedJwt);
      expect(next).toHaveBeenCalled();
    });

    it('should throw an error if user ID field is not found in the decoded JWT', async () => {
        req.headers.authorization = 'Bearer jwt_no_sub';

        const decodedJwt = { user_id: 'user124', name: 'Test User' }; // No 'id' field
        (jwt.verify as jest.Mock).mockReturnValue(decodedJwt);

        await authMiddleware(req, res, next);

        // expect(req.user).toBeUndefined(); // req.user should not be set
        expect(res.status).toHaveBeenCalledWith(401); // Middleware should return 401
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
            error: expect.objectContaining({ message: expect.stringContaining('No user ID') }),
            })
        );
        expect(next).not.toHaveBeenCalled(); // next() should not be called
    });

    it('should return 401 when no JWT is provided', async () => {
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(Error) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when JWT verification fails', async () => {
      req.headers.authorization = 'Bearer invalid_jwt';
      
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });


  
  describe('Proxy Authentication', () => {
    beforeEach(() => {
      (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
        const defaults: Record<string, any> = {
          'AUTH_MODE': 'proxy',
          'PROXY_SECRET': 'proxy_secret_123',
          'TRUSTED_PROXIES': ['trusted-app.com'],
          'PROXY_USER_ID_FIELD': 'user_id',
          'PROXY_USER_ID_SOURCE': 'body'
        };
        return defaults[key];
      });
      
      req.headers.origin = 'https://trusted-app.com';
      req.headers['x-proxy-auth'] = 'proxy_secret_123';
    });

    it('should authenticate with user ID from body', async () => {
      req.body = { user_id: 'user123' };
      
      await authMiddleware(req, res, next);
      
      expect(req.user).toEqual({ id: 'user123' });
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate with legacy user object in body', async () => {
      req.body = { user: { id: 'legacy_user' } };
      
      await authMiddleware(req, res, next);
      
      expect(req.user).toEqual({ id: 'legacy_user' });
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate with user ID from query when configured', async () => {
      (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
        const defaults: Record<string, any> = {
          'AUTH_MODE': 'proxy',
          'PROXY_SECRET': 'proxy_secret_123',
          'TRUSTED_PROXIES': ['trusted-app.com'],
          'PROXY_USER_ID_FIELD': 'user_id',
          'PROXY_USER_ID_SOURCE': 'query'
        };
        return defaults[key];
      });
      
      req.query = { user_id: 'query_user' };
      
      await authMiddleware(req, res, next);
      
      expect(req.user).toEqual({ id: 'query_user' });
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate with user ID from headers when configured', async () => {
      (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
        const defaults: Record<string, any> = {
          'AUTH_MODE': 'proxy',
          'PROXY_SECRET': 'proxy_secret_123',
          'TRUSTED_PROXIES': ['trusted-app.com'],
          'PROXY_USER_ID_FIELD': 'user_id',
          'PROXY_USER_ID_SOURCE': 'headers'
        };
        return defaults[key];
      });
      
      req.headers.user_id = 'header_user';
      
      await authMiddleware(req, res, next);
      
      expect(req.user).toEqual({ id: 'header_user' });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 when from untrusted origin', async () => {
      req.headers.origin = 'https://malicious-app.com';
      req.body = { user_id: 'user123' };
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when proxy secret is invalid', async () => {
      req.headers['x-proxy-auth'] = 'wrong_secret';
      req.body = { user_id: 'user123' };
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user ID is missing', async () => {
      req.body = {}; // No user ID
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: expect.objectContaining({ message: expect.stringContaining('User ID not found') }) 
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Custom Authentication', () => {
    const mockCustomAuth = jest.fn();
    
    beforeEach(() => {
      (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
        const defaults: Record<string, any> = {
          'AUTH_MODE': 'custom',
          'customAuthFunction': mockCustomAuth
        };
        return defaults[key];
      });
    });

    it('should authenticate using custom auth function that returns a user', async () => {
      const mockUser = { id: 'custom_user', role: 'admin' };
      mockCustomAuth.mockResolvedValue(mockUser);
      
      await authMiddleware(req, res, next);
      
      expect(mockCustomAuth).toHaveBeenCalledWith(req);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 when custom auth function throws an error', async () => {
      mockCustomAuth.mockRejectedValue(new Error('Custom auth failed'));
      
      await authMiddleware(req, res, next);
      
      expect(mockCustomAuth).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when custom auth function returns invalid user', async () => {
      mockCustomAuth.mockResolvedValue({ name: 'Invalid User' }); // Missing id field
      
      await authMiddleware(req, res, next);
      
      expect(mockCustomAuth).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when no custom auth function is provided', async () => {
      (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
        const defaults: Record<string, any> = {
          'AUTH_MODE': 'custom'
          // No customAuthFunction provided
        };
        return defaults[key];
      });
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: expect.objectContaining({ message: expect.stringContaining('not implemented') }) 
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });



  describe('Auth Endpoint Authentication', () => {
    beforeEach(() => {
      (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
        const defaults: Record<string, any> = {
          'AUTH_MODE': 'auth-endpoint',
          'AUTH_ENDPOINT_URL': 'https://example.com/api/verify-user'
        };
        return defaults[key];
      });
      
      // Reset the fetch mock
      (global.fetch as jest.Mock).mockReset();
    });

    it('should authenticate when user_id provided and endpoint returns 200', async () => {
      req.query.user_id = 'user123';
      
      // Mock fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({})
      });
      
      await authMiddleware(req, res, next);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/api/verify-user?user_id=user123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json'
          })
        })
      );
      expect(req.user).toEqual({ id: 'user123' });
      expect(next).toHaveBeenCalled();
    });

    it('should use user_id from endpoint response if provided', async () => {
      req.query.user_id = 'client_user_id';
      
      // Mock fetch response with a different user_id
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          user_id: 'server_user_id'
        })
      });
      
      await authMiddleware(req, res, next);
      
      expect(req.user).toEqual({ id: 'server_user_id' });
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate without user_id if endpoint provides it', async () => {
      // No user_id provided initially
      
      // Mock fetch response with user_id
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          user_id: 'endpoint_user_id'
        })
      });
      
      await authMiddleware(req, res, next);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/api/verify-user',
        expect.any(Object)
      );
      expect(req.user).toEqual({ id: 'endpoint_user_id' });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 when endpoint returns non-200 status', async () => {
      req.query.user_id = 'user123';
      
      // Mock fetch response with error status
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' })
      });
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when no user_id provided and endpoint response lacks user_id', async () => {
      // No user_id provided initially
      
      // Mock fetch response without user_id
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          // No user_id in response
          message: 'OKKKK'
        })
      });
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: expect.objectContaining({ message: expect.stringContaining("User id wasn't provided") }) 
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when endpoint returns non-JSON response and no initial user_id', async () => {
      // No user_id provided initially
      
      // Mock fetch response with non-JSON data
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      });
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authentication endpoint URL is not configured', async () => {
      (config.getConfigVariable as jest.Mock).mockImplementation((key) => {
        const defaults: Record<string, any> = {
          'AUTH_MODE': 'auth-endpoint'
          // No AUTH_ENDPOINT_URL provided
        };
        return defaults[key];
      });
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: expect.objectContaining({ message: expect.stringContaining('not configured') }) 
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
      req.query.user_id = 'user123';
      
      // Mock fetch error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should forward cookies when origins match', async () => {
      req.query.user_id = 'user123';
      req.headers.origin = 'https://example.com';
      
      // Mock fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({})
      });
      
      await authMiddleware(req, res, next);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include'
        })
      );
      expect(next).toHaveBeenCalled();
    });

    it('should not forward cookies when origins do not match', async () => {
      req.query.user_id = 'user123';
      req.headers.origin = 'https://other-domain.com';
      
      // Mock fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({})
      });
      
      await authMiddleware(req, res, next);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'same-origin'
        })
      );
      expect(next).toHaveBeenCalled();
    });
  });
});