const express = require('express');
const { prepararHATEOAS, getInventory, getFilterInventory } = require('./consultas');

const app = express();
const PORT = 3000;


app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});


app.get("/joyas", async (req, res) => {
  const queryStrings = req.query;
  try {
    const inventory = await getInventory(queryStrings);
    const HATEOAS = await prepararHATEOAS(inventory);
    res.json(HATEOAS);
  } catch (error) {
    next(error); 
  }
});


app.get("/joyas/filtros", async (req, res) => {
  const { precio_max, precio_min, categoria, metal } = req.query;
  try {
    const filteredInventory = await getFilterInventory({ precio_max, precio_min, categoria, metal });
    res.json(filteredInventory);
  } catch (error) {
    next(error); 
  }
});


app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

