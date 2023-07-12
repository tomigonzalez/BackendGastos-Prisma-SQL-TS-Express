import inquirer from "inquirer";
import fs from "fs";
import { promptNewGasto } from "./gastosPrompts.js";
import mysql from "mysql";

const DATABASE_URL =
  'mysql://np0cwupzw64688krzuqp:pscale_pw_y6DTjNi3F6Bq0wE0QLn8KOpPaciCZqUkRTWc64PxlQg@aws.connect.psdb.cloud/2317?ssl={"rejectUnauthorized":true}';

const connection = mysql.createConnection(DATABASE_URL);

connection.connect((error) => {
  if (error) {
    console.error("Error connecting to database:", error);
    return;
  }

  console.log("Connected to database!");

  main();
});

// connection.query("SELECT * FROM gastos;", function (error, results, fields) {
//   if (error) throw error;
//   console.log("The solution is: ", results[0].solution);
// });

const main = async () => {
  let go = true;
  while (go) {
    const action = await inquirer.prompt([
      {
        type: "list",
        name: "chose",
        message: "Actions:",
        choices: [
          { value: 1, name: "Get all Spends" },
          { value: 2, name: "Create new Spends" },
          { value: 3, name: "Total spends" },
          { value: 4, name: "Total spends by category" },
          { value: 5, name: "Migrate Data" },
          { value: 99, name: "EXIT" },
        ],
      },
    ]);
    console.log(action);
    switch (action.chose) {
      case 1:
        await getAllGastos();
        break;
      case 2:
        await createNewGastos();
        break;
      case 3:
        await totalSpends();
        break;
      case 4:
        await totalSpendsByCategory();
        break;
      case 5:
        await migrateData();
        break;
      case 99:
        go = false;
        break; // Añade un break para salir del switch
      default:
        go = false;
        break; // Añade un break para salir del switch
    }
  }
  console.log("bye");

  // Cierra la conexión a la base de datos al finalizar
  connection.end();
};

async function createNewGastos() {
  console.log("Adding new spend:");
  const newGastosData = await promptNewGasto();
  connection.query(
    "INSERT INTO gastos (monto, descripcion, fecha, categoria) VALUES (?, ?, ?, ?)",
    [
      newGastosData.monto,
      newGastosData.descripcion,
      newGastosData.fecha,
      newGastosData.categoria,
    ],
    (error, results) => {
      if (error) {
        console.error("Error creating new spend:", error);
      } else {
        console.log("New spend created successfully!");
      }
    }
  );
}

async function getAllGastos() {
  console.log("Getting spends: ");
  connection.query("SELECT * FROM gastos", (error, results) => {
    if (error) {
      console.error("Error getting spends:", error);
    } else {
      console.log(results);
    }
  });
}
async function totalSpends() {
  console.log("Calculating total spends: ");
  connection.query("SELECT monto FROM gastos", (error, results) => {
    if (error) {
      console.error("Error getting spends:", error);
    } else {
      const total = results.reduce((acc, gasto) => {
        const monto = parseFloat(gasto.monto);
        return isNaN(monto) ? acc : acc + monto;
      }, 0);
      console.log(`El total de gastos es: $${total}`);
    }
  });
}

async function totalSpendsByCategory() {
  console.log("Calculating total spends for category:");
  connection.query("SELECT categoria, monto FROM gastos", (error, results) => {
    if (error) {
      console.error("Error getting spends:", error);
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

      console.log("Totales por categoría:");
      for (const categoria in totalsByCategory) {
        console.log(`${categoria}: $${totalsByCategory[categoria]}`);
      }
    }
  });
}

async function migrateData() {
  try {
    console.log("Migrating data...");

    // Leer el archivo JSON
    const jsonData = fs.readFileSync("gastos.json", "utf-8");

    // Parsear los datos JSON
    const data = JSON.parse(jsonData);

    // Iterar sobre los datos y realizar la inserción en la base de datos
    for (const item of data) {
      await insertData(item);
    }

    console.log("Data migration completed!");
  } catch (error) {
    console.error("Error migrating data:", error);
  }
}
async function insertData(data) {
  if (!data.monto || isNaN(parseFloat(data.monto))) {
    // Si el campo "monto" es vacío o no es un número válido, rechazar la promesa
  } else {
    return new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO gastos (monto, descripcion, fecha, categoria) VALUES (?, ?, ?, ?)",
        [data.monto, data.descripcion, data.fecha, data.categoria],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
