import express from "express";
import { OfferController } from "../controllers/offers.controller";
import { authenticate } from "../../src/common/jwt/onBoardAuth";
import multer from "multer"; // 👈 ADDED: Import Multer

const router = express.Router();
const offerControllerInstance = new OfferController();


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});



/**
 * @swagger
 * /api/v1/offers/image/{fileId}:
 *   get:
 *     summary: Retrieve an offer image by its file ID
 *     description: Streams the image file content directly from GridFS storage using the file ID stored in the offer model. This endpoint does NOT require authentication.
 *     tags: [Offers]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         description: The MongoDB GridFS file ID (string) of the image.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8c1e4c7d0e83"
 *     responses:
 *       200:
 *         description: Image successfully streamed. Content-Type will be image/jpeg, image/png, etc.
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid file ID format.
 *       404:
 *         description: Image not found.
 *       500:
 *         description: Error streaming file.
 */
router.get("/image/:fileId", offerControllerInstance.getImage);



/**
 * @swagger
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       required:
 *         - store
 *         - location
 *         - offerType
 *         - offerTitle
 *         - offerDescription
 *         - startDate
 *         - endDate
 *         - selectOfferStatus
 *         - applicableProducts
 *         - offerStatus
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the offer.
 *           readOnly: true
 *           example: "60c72b2f9b1d8c1e4c7d0e83"
 *         store:
 *           type: string
 *           description: The ID of the store the offer belongs to.
 *           example: "60c72b2f9b1d8c1e4c7d0e82"
 *         location:
 *           type: string
 *           description: The location where the offer is applicable.
 *           example: "New York"
 *         offerType:
 *           type: string
 *           description: The type of offer.
 *           enum: [Day Offers, Offers By Value, BOGO]
 *           example: "Offers By Value"
 *         offerTitle:
 *           type: string
 *           description: The title of the offer.
 *           example: "Get 20% off on all items"
 *         offerDescription:
 *           type: string
 *           description: A detailed description of the offer.
 *           example: "A limited-time offer for all customers."
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The start date of the offer.
 *           example: "2023-10-27T00:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: The end date of the offer.
 *           example: "2023-11-27T00:00:00.000Z"
 *         discountPercentage:
 *           type: number
 *           description: The percentage discount value.
 *           nullable: true
 *           example: 20
 *         minSpendAmount:
 *           type: number
 *           description: The minimum spend amount to avail the offer.
 *           nullable: true
 *           example: 50
 *         couponCode:
 *           type: string
 *           description: A coupon code for the offer.
 *           nullable: true
 *           example: "FALL2023"
 *         selectOfferStatus:
 *           type: string
 *           description: The status selected for the offer.
 *           example: "Active"
 *         applicableProducts:
 *           type: string
 *           description: The products to which the offer applies.
 *           example: "All products"
 *         offerImages:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of image URLs (or file IDs) for the offer.
 *           nullable: true
 *         audience:
 *           type: string
 *           description: The target audience for the offer.
 *           enum: [Public, Private]
 *           default: "Public"
 *           example: "Public"
 *         offerStatus:
 *           type: string
 *           description: The current status of the offer.
 *           example: "Published"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the offer was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the offer was last updated.
 *           readOnly: true
 */

/**
 * @swagger
 * /api/v1/offers:
 *   post:
 *     summary: Add a new offer for a specific store
 *     description: Creates a new offer and assigns it to a store owned by the authenticated user.
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               store: { type: string, description: "The ID of the store.", example: "60c72b2f9b1d8c1e4c7d0e82" }
 *               location: { type: string, example: "New York" }
 *               offerType: { type: string, enum: [Day Offers, Offers By Value, BOGO], example: "Offers By Value" }
 *               offerTitle: { type: string, example: "Get 20% off on all items" }
 *               offerDescription: { type: string, example: "A limited-time offer for all customers." }
 *               startDate: { type: string, format: "date-time", example: "2023-10-27T00:00:00.000Z" }
 *               endDate: { type: string, format: "date-time", example: "2023-11-27T00:00:00.000Z" }
 *               discountPercentage: { type: number, example: 20 }
 *               minSpendAmount: { type: number, example: 50 }
 *               couponCode: { type: string, example: "FALL2023" }
 *               selectOfferStatus: { type: string, example: "Active" }
 *               applicableProducts: { type: string, example: "All products" }
 *               audience: { type: string, example: "Public" }
 *               offerStatus: { type: string, example: "Published" }
 *               offerImages:
 *                 type: array
 *                 description: Array of image files for the offer (max 5).
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Offer has been successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offer_id:
 *                   type: string
 *                   example: "60c72b2f9b1d8c1e4c7d0e83"
 *                 offer_title:
 *                   type: string
 *                   example: "Get 20% off on all items"
 *       400:
 *         description: Bad Request. Invalid input data.
 *       401:
 *         description: Unauthorized. Authentication required.
 *       404:
 *         description: Store not found or you do not have permission to add an offer to it.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/",
  authenticate,
  upload.array("offerImages", 5), // 👈 Multer middleware for file uploads
  offerControllerInstance.addOffer
);

/**
 * @swagger
 * /api/v1/offers:
 *   get:
 *     summary: Get all offers for the authenticated user's stores
 *     description: Retrieves a list of all offers associated with the authenticated user's stores.
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Offers fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offer'
 *       401:
 *         description: Unauthorized. Authentication required.
 *       500:
 *         description: Internal server error.
 */
router.get("/", authenticate, offerControllerInstance.getOffers);

/**
 * @swagger
 * /api/v1/offers/{offer_id}:
 *   put:
 *     summary: Update an offer by its ID
 *     description: Updates a specific offer belonging to a store owned by the authenticated user.
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offer_id
 *         required: true
 *         description: The ID of the offer to update.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8c1e4c7d0e83"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               location: { type: string, example: "Los Angeles" }
 *               offerType: { type: string, enum: [Day Offers, Offers By Value, BOGO], example: "Day Offers" }
 *               offerTitle: { type: string, example: "New Offer: 30% Off!" }
 *               offerDescription: { type: string, example: "Updated offer description." }
 *               discountPercentage: { type: number, example: 30 }
 *               minSpendAmount: { type: number, example: 75 }
 *               couponCode: { type: string, example: "SUMMER2024" }
 *               selectOfferStatus: { type: string, example: "Inactive" }
 *               applicableProducts: { type: string, example: "Specific products only" }
 *               audience: { type: string, example: "Private" }
 *               offerStatus: { type: string, example: "Draft" }
 *               offerImages:
 *                 type: array
 *                 description: Array of image files for the offer (max 5). Replaces existing images.
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Offer updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 *       400:
 *         description: Bad Request. Invalid input data.
 *       401:
 *         description: Unauthorized. Authentication required.
 *       404:
 *         description: Offer not found or you do not have permission to update it.
 *       500:
 *         description: Internal server error.
 */
router.put(
  "/:offer_id",
  authenticate,
  upload.array("offerImages", 5),
  offerControllerInstance.updateOffer
);

/**
 * @swagger
 * /api/v1/offers/{offer_id}:
 *   delete:
 *     summary: Delete an offer by its ID
 *     description: Deletes a specific offer belonging to a store owned by the authenticated user.
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offer_id
 *         required: true
 *         description: The ID of the offer to delete.
 *         schema:
 *           type: string
 *           example: "60c72b2f9b1d8c1e4c7d0e83"
 *     responses:
 *       200:
 *         description: Offer deleted successfully.
 *       401:
 *         description: Unauthorized. Authentication required.
 *       404:
 *         description: Offer not found or you do not have permission to delete it.
 *       500:
 *         description: Internal server error.
 */
router.delete("/:offer_id", authenticate, offerControllerInstance.deleteOffer);

module.exports = router;
