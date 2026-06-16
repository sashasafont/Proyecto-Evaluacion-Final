const router = require("express").Router();
const {
    getCanales,
    getCanalById,
    createCanal,
    updateCanal,
    deleteCanal
} = require("../controllers/canal.controller");

router.get("/", getCanales);
router.get("/:id", getCanalById);
router.post("/", createCanal);
router.put("/:id", updateCanal);
router.delete("/:id", deleteCanal);

module.exports = router;
