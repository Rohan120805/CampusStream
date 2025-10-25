import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import User from '../models/user.model.js';

// Create JWKS client for Auth0
const client = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true
});

// Function to get signing key
const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
            return;
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
};

/**
 * Middleware to verify Auth0 token and authenticate user
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify JWT token with Auth0 public key
        jwt.verify(
            token,
            getKey,
            {
                audience: process.env.AUTH0_AUDIENCE,
                issuer: `https://${process.env.AUTH0_DOMAIN}/`,
                algorithms: ['RS256']
            },
            async (err, decoded) => {
                if (err) {
                    console.error('JWT Verification Error:', err.message);
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Invalid token',
                        error: err.message 
                    });
                }

                if (!decoded || !decoded.sub) {
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Invalid token payload' 
                    });
                }

                try {
                    // Find or create user
                    let user = await User.findOne({ auth0Id: decoded.sub });

                    if (!user) {
                        // Auto-create user on first login - everyone is a regular user
                        const email = decoded.email || decoded[`${process.env.AUTH0_AUDIENCE}/email`];
                        const name = decoded.name || decoded[`${process.env.AUTH0_AUDIENCE}/name`] || email?.split('@')[0];
                        const picture = decoded.picture || decoded[`${process.env.AUTH0_AUDIENCE}/picture`] || '';

                        user = await User.create({
                            auth0Id: decoded.sub,
                            email: email,
                            name: name,
                            picture: picture,
                            role: 'user' // Everyone is a regular user
                        });
                        
                        console.log('✅ New user created:', user.email);
                    }

                    // Check if user is active
                    if (!user.isActive) {
                        return res.status(403).json({ 
                            success: false, 
                            message: 'Account is deactivated' 
                        });
                    }

                    // Attach user to request
                    req.user = user;
                    req.userId = user._id;
                    req.auth0User = decoded;
                    next();
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Database error',
                        error: dbError.message 
                    });
                }
            }
        );
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication failed',
            error: error.message 
        });
    }
};