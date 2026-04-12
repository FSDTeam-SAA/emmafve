import { Router } from "express";
import { authGuard, allowRole } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.midleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from "./contact.controller";
import { contactValidation } from "./contact.validation";

const router = Router();

router.get("/get-all-contacts", getAllContacts);
router.get("/get-single-contact/:contactId", getContactById);

router.use(authGuard, allowRole("admin"));

router.post(
  "/create-contact",
  upload.single("image"),
  validateRequest(contactValidation.createContactSchema),
  createContact,
);

router.patch(
  "/update-contact/:contactId",
  upload.single("image"),
  validateRequest(contactValidation.updateContactSchema),
  updateContact,
);

router.delete("/delete-contact/:contactId", deleteContact);

export const contactRoute = router;
