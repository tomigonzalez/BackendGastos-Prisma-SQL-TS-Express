import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

//////////////////CONNECTION/////////////////////////
const app = express();
const port = 3000;

const DATABASE_URL =
  'mysql://spl75bxzzfju24t3n56m:pscale_pw_C1qyPM30cO0NXhZnU4XPu0DrTs2HD3sSjHWv4a5v8B9@aws.connect.psdb.cloud/2317?ssl={"rejectUnauthorized":true}';

const connection = mysql.createConnection(DATABASE_URL);

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to database:", error);
    return;
  }

  console.log("Connected to database!");
});

// Parse application/orm-urlencodedx-www-f
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/spends", (req, res) => {
  console.log("Adding new spend:");

  const monto = req.body.monto;
  const descripcion = req.body.descripcion;
  const fecha = req.body.fecha;
  const categoria = req.body.categoria;

  connection.query(
    "INSERT INTO gastos (monto, descripcion, fecha, categoria) VALUES (?, ?, ?, ?)",
    [monto, descripcion, fecha, categoria],
    (error, results) => {
      if (error) {
        console.error("Error creating new spend:", error);
        res.status(500).send("Error creating new spend");
      } else {
        res.send("New spend created successfully!");
      }
    }
  );
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get("/crear-gasto", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/spends", (req, res) => {
  console.log("Getting spends: ");
  connection.query("SELECT * FROM gastos", (error, results) => {
    if (error) {
      console.error("Error getting spends:", error);
      res.status(500).send("Error getting spends");
    } else {
      res.json(results);
    }
  });
});

app.get("/spends/total", (req, res) => {
  console.log("Calculating total spends: ");
  connection.query("SELECT monto FROM gastos", (error, results) => {
    if (error) {
      console.error("Error getting spends:", error);
      res.status(500).send("Error getting spends");
    } else {
      const total = results.reduce((acc, gasto) => {
        const monto = parseFloat(gasto.monto);
        return isNaN(monto) ? acc : acc + monto;
      }, 0);
      res.send(`El total de gastos es: $${total}`);
    }
  });
});

app.get("/spends/total-by-category", (req, res) => {
  console.log("Calculating total spends for category:");
  connection.query("SELECT categoria, monto FROM gastos", (error, results) => {
    if (error) {
      console.error("Error getting spends:", error);
      res.status(500).send("Error getting spends");
    } else {
      const totalsByCategory = {};
      results.forEach((gasto) => {
        const categoria = gasto.categoria;
        const monto = parseFloat(gasto.monto);
        if (!isNaN(monto)) {
          if (totalsByCategory[categoria]) {
            totalsByCategory[categoria] += monto;
          } else {
            totalsByCategory[categoria] = monto;
          }
        }
      });

      res.json(totalsByCategory);
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

process.on("SIGINT", () => {
  connection.end((err) => {
    if (err) {
      console.error("Error closing database connection:", err);
    } else {
      console.log("Database connection closed!");
    }
    process.exit();
  });
});
