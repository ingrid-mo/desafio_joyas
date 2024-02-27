const { Pool } = require("pg");
const format = require('pg-format');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "kataang65",
    database: "joyas",
    port: 5432,
    allowExitOnIdle: true
});

const getInventory = async ({ limits = 10, order_by = "id_ASC", page = 0 }) => {
    const [campo, direccion] = order_by.split("_");
    const offset = page * limits;
    const formattedQuery = format('SELECT * FROM inventario ORDER BY %I %s LIMIT %L OFFSET %L', campo, direccion, limits, offset);
    try {
        const { rows: inventario } = await pool.query(formattedQuery);
        return inventario;
    } catch (error) {
        console.error("Error en getInventory:", error);
        throw error;
    }
}

const prepararHATEOAS = (joyas) => {
    const results = joyas.map((j) => {
        return {
            name: j.nombre,
            href: `/joyas/joya/${j.id}`,
        };
    }).slice(0, 4);
    const total = joyas.length;
    const HATEOAS = {
        total,
        results
    };
    return HATEOAS;
}

const getFilterInventory = async ({ precio_max, precio_min, categoria, metal }) => {
    let filtros = [];
    const values = [];
    
    const agregarFiltro = (campo, comparador, valor) => {
        values.push(valor);
        const length = values.length;
        filtros.push(`${campo} ${comparador} $${length}`);
    };
    if (precio_max) agregarFiltro('precio', '<=', precio_max);
    if (precio_min) agregarFiltro('precio', '>=', precio_min);
    if (categoria) agregarFiltro('categoria', '=', categoria);
    if (metal) agregarFiltro('metal', '=', metal);

    let consulta = "SELECT * FROM inventario";
    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(" AND ")}`;
    }
    try {
        const { rows: inventario } = await pool.query(consulta, values);
        return inventario;
    } catch (error) {
        console.error("Error en getFilterInventory:", error);
        throw error;
    }
}

// Middleware para generar informes o reportes
const reportMiddleware = (req, res, next) => {
    console.log(`Se realizó una consulta a la ruta: ${req.path}`);
    next();
};

module.exports = { getInventory, prepararHATEOAS, getFilterInventory, reportMiddleware };
