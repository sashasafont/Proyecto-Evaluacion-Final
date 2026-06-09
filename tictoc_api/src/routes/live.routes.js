const router = require("express").Router();
const {
    getLives,
    getLiveById,
    createLive,
    updateLive,
    deleteLive
} = require("../controllers/live.controller");

router.get("/", getLives);
router.get("/:id", getLiveById);
router.post("/", createLive);
router.put("/:id", updateLive);
router.delete("/:id", deleteLive);

module.exports = router;
