import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import User from '../models/user.model.js';

// Lazy-initialize JWKS client (will be created on first use)
let client = null;

// Function to get or create JWKS client
const getClient = () => {
    if (!client) {
        if (!process.env.AUTH0_DOMAIN) {
            throw new Error('AUTH0_DOMAIN environment variable is not set');
        }
        client = jwksClient({
            jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
            cache: true,
            rateLimit: true
        });
        console.log('✅ JWKS Client initialized for:', process.env.AUTH0_DOMAIN);
    }
    return client;
};

// Function to get signing key
const getKey = (header, callback) => {
    try {
        const jwksClient = getClient();
        jwksClient.getSigningKey(header.kid, (err, key) => {
            if (err) {
                callback(err);
                return;
            }
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        });
    } catch (error) {
        callback(error);
    }
};

/**
 * Middleware to verify Auth0 token and authenticate user
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        console.log('🔐 Auth attempt - Headers:', {
            hasAuth: !!authHeader,
            authPrefix: authHeader?.substring(0, 20)
        });
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No token provided');
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('🔍 Token received, length:', token.length);

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
                    console.error('❌ JWT Verification Error:', err.message);
                    console.error('   Expected audience:', process.env.AUTH0_AUDIENCE);
                    console.error('   Expected issuer:', `https://${process.env.AUTH0_DOMAIN}/`);
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Invalid token',
                        error: err.message 
                    });
                }

                if (!decoded || !decoded.sub) {
                    console.log('❌ Invalid token payload - no sub');
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Invalid token payload' 
                    });
                }

                console.log('✅ Token verified for:', decoded.sub);
                console.log('   Token claims:', Object.keys(decoded));
                console.log('   Full token payload:', JSON.stringify(decoded, null, 2));

                try {
                    // Extract email from token - try multiple possible locations
                    const email = decoded.email || 
                                decoded[`${process.env.AUTH0_AUDIENCE}/email`] ||
                                decoded['https://campusstream-api/email'];
                    
                    console.log('📧 Email from token:', email);
                    console.log('   Checking: decoded.email =', decoded.email);
                    console.log('   Checking: decoded[audience/email] =', decoded[`${process.env.AUTH0_AUDIENCE}/email`]);
                    console.log('   Checking: decoded[hardcoded/email] =', decoded['https://campusstream-api/email']);
                    
                    // Verify email exists in token
                    if (!email) {
                        console.log('❌ No email found in token');
                        return res.status(403).json({
                            success: false,
                            message: 'Email not found in token. Please ensure email is included in Auth0 token.'
                        });
                    }
                    
                    // Find or create user
                    let user = await User.findOne({ auth0Id: decoded.sub });

                    if (!user) {
                        // Auto-create user on first login - everyone is a regular user
                        const name = decoded.name || 
                                   decoded[`${process.env.AUTH0_AUDIENCE}/name`] || 
                                   decoded['https://campusstream-api/name'] ||
                                   email?.split('@')[0];
                        const picture = decoded.picture || 
                                      decoded[`${process.env.AUTH0_AUDIENCE}/picture`] || 
                                      decoded['https://campusstream-api/picture'] ||
                                      '';

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
                        console.log('❌ User account deactivated:', user.email);
                        return res.status(403).json({ 
                            success: false, 
                            message: 'Account is deactivated' 
                        });
                    }

                    console.log('✅ User authenticated:', user.email);
                    
                    // Attach user to request
                    req.user = user;
                    req.userId = user._id;
                    req.auth0User = decoded;
                    next();
                } catch (dbError) {
                    console.error('❌ Database error:', dbError);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Database error',
                        error: dbError.message 
                    });
                }
            }
        );
    } catch (error) {
        console.error('❌ Authentication error:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication failed',
            error: error.message 
        });
    }
};