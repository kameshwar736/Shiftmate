import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { createSwapRequest, getIncomingSwapRequests, getMySwapRequests, getPendingManagerSwapRequests, getReceivedSwapRequestHistory, managerRespondToSwapRequest, respondToSwapRequest } from "../controller/swapController.js";

const router = express.Router();


//http://localhost:5000/api/swaps/  - swap request by employee

router.post(
    "/",
    authMiddleware,
    roleMiddleware("employee"),
    createSwapRequest
);

//http://localhost:5000/api/swaps/incoming
router.get(
    "/incoming",
    authMiddleware,
    roleMiddleware("employee"),
    getIncomingSwapRequests
);

//http://localhost:5000/api/swaps/:id/respond
router.patch(
    "/:id/respond",
    authMiddleware,
    roleMiddleware("employee"),
    respondToSwapRequest
);

//http://localhost:5000/api/swaps/manager/pending
router.get(
    "/manager/pending",
    authMiddleware,
    roleMiddleware("manager"),
    getPendingManagerSwapRequests
);


//http://localhost:5000/api/swaps/manager/:id/respond
router.patch(
    "/manager/:id/respond",
    authMiddleware,
    roleMiddleware("manager"),
    managerRespondToSwapRequest
);


//http://localhost:5000/api/swaps/my-requests

router.get(
    "/my-requests",
    authMiddleware,
    roleMiddleware("employee"),
    getMySwapRequests
);

//http://localhost:5000/api/swaps/received-history


router.get(
    "/received-history",
    authMiddleware,
    roleMiddleware("employee"),
    getReceivedSwapRequestHistory
);



export default router;