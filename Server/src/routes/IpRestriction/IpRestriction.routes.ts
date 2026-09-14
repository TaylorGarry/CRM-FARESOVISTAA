import { Router } from "express";

import {
    allowIprestriction,
    deleteIpRestriction,
    editIpRestriction,
    getIpRestrictions,
} from "../../controllers/IpRestrictions/IpRestriction.controller";

const router = Router();

// Create IP restriction
router.post("/restrict-ip", allowIprestriction);

// Get all allowed IP restrictions
router.get("/allowed-ip", getIpRestrictions);

// Edit allowed IP restriction
router.put("/:id", editIpRestriction);

// Delete allowed IP restriction
router.delete("/:id", deleteIpRestriction);

export default router;