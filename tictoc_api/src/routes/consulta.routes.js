const router = require("express").Router();
const {
    getBloqueadosByUsuarioId,
    getSeguidoresCountByCanalUsuarioId,
    getBilleteraByUsuarioId,
    getColeccionByUsuarioId,
    getChatsPrivadosByUsuarioId,
    getUsuarioByMensajeLiveId,
    getLiveStatusByCanalId,
    getLiveContentByLiveId,
    getNotificacionesByUsuarioId,
    getReportesByUsuarioId
} = require("../controllers/consulta.controller");

router.get("/bloqueados/:id", getBloqueadosByUsuarioId);
router.get("/seguidores/:id", getSeguidoresCountByCanalUsuarioId);
router.get("/billetera/:id", getBilleteraByUsuarioId);
router.get("/coleccion/:id", getColeccionByUsuarioId);
router.get("/chats-privados/:id", getChatsPrivadosByUsuarioId);
router.get("/chat-live/:id", getUsuarioByMensajeLiveId);
router.get("/live-status/:id", getLiveStatusByCanalId);
router.get("/live-content/:id", getLiveContentByLiveId);
router.get("/notificaciones/:id", getNotificacionesByUsuarioId);
router.get("/reportes/:id", getReportesByUsuarioId);

module.exports = router;
