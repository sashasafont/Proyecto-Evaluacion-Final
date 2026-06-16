require("dotenv").config();

const express = require("express");
const cors = require("cors");

const usuarioRoutes = require("./routes/usuario.routes");
const canalRoutes = require("./routes/canal.routes");
const liveRoutes = require("./routes/live.routes");
const consultaRoutes = require("./routes/consulta.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/canales", canalRoutes);
app.use("/api/lives", liveRoutes);
app.use("/api/consultas", consultaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
