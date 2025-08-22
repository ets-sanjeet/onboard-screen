
import express from "express";
const router = express.Router();
import { UserController } from "../controllers/users.controller";
import { authenticate } from '../../src/common/jwt/onBoardAuth';


// create a new instance of UserController.
const userControllerInstance = new UserController();

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends an OTP if the email is not verified.
 *     tags:
 *       - Registering a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: abcd27
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abcd27@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 12345678
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User successfully registered."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: abcd27@gmail.com
 *                     token:
 *                       type: string
 *                       nullable: true
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation Error"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Username is required", "Email is invalid"]
 *       409:
 *         description: Conflict - Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email is already in use."
 */
router.post("/register", userControllerInstance.register);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates a user and returns an access token if successful.
 *     tags:
 *       - User Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: abcd27@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login successful, returns an access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "ok"
 *                 accesstoken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error (missing email/password or incorrect format)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation Error"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Email is required", "Password must not be empty"]
 *       401:
 *         description: Unauthorized - Invalid credentials or email not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid username or password"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "abcd27@gmail.com does not exist."
 */
router.post("/login", userControllerInstance.login);

/**
 * @swagger
 * /api/v1/users/verify-otp:
 *   post:
 *     summary: Verify OTP for email authentication
 *     description: Validates the OTP along with the provided token and verifies the user's email.
 *     tags:
 *       - Account Verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "abcd27@gmail.com"
 *               token:
 *                 type: string
 *                 description: "OTP verification token received during registration"
 *                 example: "existing-token-string"
 *               otp:
 *                 type: string
 *                 description: "8-digit OTP code"
 *                 example: "12345678"
 *     responses:
 *       200:
 *         description: Email successfully verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email successfully verified."
 *       400:
 *         description: Invalid or expired OTP/token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP provided."
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with email abcd27@gmail.com not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error occurred."
 */
router.post("/verify-otp", userControllerInstance.verifyOTPViaClient);

/**
 * @swagger
 * /api/v1/users/send-otp:
 *   post:
 *     summary: Resend OTP for email verification
 *     description: Resends a new OTP if the previous one has expired; returns a new token if applicable.
 *     tags:
 *       - Account Verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "abcd27@gmail.com"
 *               token:
 *                 type: string
 *                 description: "OTP verification token received during registration"
 *                 example: "old-token-string"
 *     responses:
 *       200:
 *         description: OTP sent successfully or token is still valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "abcd27@gmail.com"
 *                     token:
 *                       type: string
 *                       example: "new-token-string-if-generated"
 *       400:
 *         description: Invalid token or missing OTP details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token provided."
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with email abcd27@gmail.com not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error occurred."
 */
router.post("/send-otp", userControllerInstance.sendOTPViaEmail);

/**
 * @swagger
 * /api/v1/users/onboarding:
 *   post:
 *     summary: Complete user onboarding
 *     description: Updates the user profile with onboarding details.
 *     tags:
 *       - User Onboarding
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - profession
 *               - company_name
 *               - team_size
 *               - looking_for
 *               - is_onboarding_complete
 *               - email
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Jane"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               profession:
 *                 type: string
 *                 enum: ["Brand Owner", "C Suit", "Franchaise Owner", "Freelancer"]
 *                 example: "Brand Owner"
 *               company_name:
 *                 type: string
 *                 example: "Acme Corp"
 *               industry:
 *                 type: string
 *                 nullable: true
 *                 example: "Technology"
 *               team_size:
 *                 type: string
 *                 enum: ["1-10", "11-50", "51-250", "251-1K", "1K-5K", "5K-10K", "10K-50K", "50K-100K", "100K+"]
 *                 example: "11-50"
 *               looking_for:
 *                 type: string
 *                 enum: ["Brand Management", "Community Sharing", "Analyze & insights", "Brand Strategy", "Brand Reputation"]
 *                 example: "Brand Management"
 *               is_onboarding_complete:
 *                 type: boolean
 *                 example: true
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.doe@example.com"
 *     responses:
 *       200:
 *         description: Onboarding successful, returns updated user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User onboarding completed successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         profession:
 *                           type: string
 *                         company_name:
 *                           type: string
 *                         industry:
 *                           type: string
 *                         team_size:
 *                           type: string
 *                         looking_for:
 *                           type: string
 *                         is_onboarding_complete:
 *                           type: boolean
 *                         email:
 *                           type: string
 *       400:
 *         description: Invalid or missing data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation Error"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["First name is required"]
 *       401:
 *         description: Unauthorized - Missing or invalid bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error occurred."
 */
router.post("/onboarding", authenticate, userControllerInstance.onboarding);

module.exports = router;
