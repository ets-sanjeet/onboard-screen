import express from "express";
import { StoreController } from "../controllers/store.controller";
import { authenticate } from "../../src/common/jwt/onBoardAuth";

const router = express.Router();
const storeControllerInstance = new StoreController();

/**
 * @swagger
 * /api/v1/stores:
 *   post:
 *     summary: Add a new store for the authenticated user
 *     description: Creates a new store and assigns it to the authenticated user.
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_name
 *               - store_type
 *               - email_id
 *               - manager_email_id
 *               - address
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               store_name:
 *                 type: string
 *                 example: "My Awesome Store"
 *               store_type:
 *                 type: string
 *                 example: "Retail"
 *               email_id:
 *                 type: string
 *                 example: "myawesomestore@example.com"
 *               manager_email_id:
 *                 type: string
 *                 example: "manager@example.com"
 *               address:
 *                 type: string
 *                 example: "123 Main Street"
 *               city:
 *                 type: string
 *                 example: "Someplace"
 *               state:
 *                 type: string
 *                 example: "SomeState"
 *               pincode:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       201:
 *         description: Store has been successfully added.
 *       401:
 *         description: Unauthorized. Authentication required.
 *       409:
 *         description: Conflict. A store with this email already exists.
 *       500:
 *         description: Internal server error.
 */
router.post("/", authenticate, storeControllerInstance.addStore);

/**
 * @swagger
 * /api/v1/stores:
 *   get:
 *     summary: Get all stores for the authenticated user
 *     description: Retrieves a list of all stores associated with the authenticated user.
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stores fetched successfully.
 *       401:
 *         description: Unauthorized. Authentication required.
 *       500:
 *         description: Internal server error.
 */
router.get("/", authenticate, storeControllerInstance.getStores);

/**
 * @swagger
 * /api/v1/stores/{store_id}:
 *   put:
 *     summary: Update a store by its ID
 *     description: Updates a specific store belonging to the authenticated user.
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: store_id
 *         required: true
 *         description: The ID of the store to update.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8c1e4c7d0e82"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               store_name:
 *                 type: string
 *                 example: "Updated Store Name"
 *               store_type:
 *                 type: string
 *                 example: "E-commerce"
 *               email_id:
 *                 type: string
 *                 example: "updated_store@example.com"
 *               manager_email_id:
 *                 type: string
 *                 example: "updated_manager@example.com"
 *               address:
 *                 type: string
 *                 example: "456 New Street"
 *               city:
 *                 type: string
 *                 example: "New City"
 *               state:
 *                 type: string
 *                 example: "New State"
 *               pincode:
 *                 type: string
 *                 example: "54321"
 *     responses:
 *       200:
 *         description: Store updated successfully.
 *       401:
 *         description: Unauthorized. Authentication required.
 *       404:
 *         description: Store not found or user does not have permission to update it.
 *       409:
 *         description: Conflict. A store with this email already exists.
 *       500:
 *         description: Internal server error.
 */
router.put("/:store_id", authenticate, storeControllerInstance.updateStore);

/**
 * @swagger
 * /api/v1/stores/{store_id}:
 *   delete:
 *     summary: Delete a store by its ID
 *     description: Deletes a specific store belonging to the authenticated user.
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: store_id
 *         required: true
 *         description: The ID of the store to delete.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8c1e4c7d0e82"
 *     responses:
 *       200:
 *         description: Store deleted successfully.
 *       401:
 *         description: Unauthorized. Authentication required.
 *       404:
 *         description: Store not found or user does not have permission to delete it.
 *       500:
 *         description: Internal server error.
 */
router.delete("/:store_id", authenticate, storeControllerInstance.deleteStore);

module.exports = router;
