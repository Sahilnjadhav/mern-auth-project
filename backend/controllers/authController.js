const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^[0-9]{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


// ================= REGISTER =================

const registerUser = async (req, res) => {
    try {
        const {
            name,
            mobile,
            email,
            password
        } = req.body;

        // Check required fields
        if (!name || !mobile || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Clean data
        const cleanName = name.trim();
        const cleanEmail = email.toLowerCase().trim();
        const cleanMobile = mobile.trim();

        // Mobile validation
        if (!mobileRegex.test(cleanMobile)) {
            return res.status(400).json({
                message: "Mobile must contain exactly 10 digits"
            });
        }

        // Email validation
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email"
            });
        }

        // Password validation
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be 8+ characters with uppercase, lowercase and number"
            });
        }

        // Check existing email/mobile
        const existingUser = await User.findOne({
            $or: [
                { email: cleanEmail },
                { mobile: cleanMobile }
            ]
        });

        if (existingUser) {

            if (existingUser.email === cleanEmail) {
                return res.status(409).json({
                    message: "Email is already registered"
                });
            }

            if (existingUser.mobile === cleanMobile) {
                return res.status(409).json({
                    message: "Mobile number is already registered"
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name: cleanName,
            mobile: cleanMobile,
            email: cleanEmail,
            password: hashedPassword
        });

        // Response
        res.status(201).json({
            message: "Registration successful",

            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email
            }
        });

    } catch (error) {

        console.log(error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email or mobile is already registered"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= LOGIN =================

const loginUser = async (req, res) => {
    try {

        const {
            identifier,
            password
        } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                message: "Email/mobile and password are required"
            });
        }

        const cleanIdentifier = identifier.toLowerCase().trim();

        // Find user using email OR mobile
        const user = await User.findOne({
            $or: [
                { email: cleanIdentifier },
                { mobile: identifier.trim() }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email/mobile or password"
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email/mobile or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Response
        res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= GET PROFILE =================

const getProfile = async (req, res) => {
    try {

        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Get user ID from token
        const userId = decoded.userId;

        // Find user in MongoDB
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Send profile
        res.status(200).json({
            message: "Profile fetched successfully",

            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email
            }
        });

    } catch (error) {

        console.log(error);

        // JWT errors
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= EXPORT =================

module.exports = {
    registerUser,
    loginUser,
    getProfile
};
