import inquirer from "inquirer";
import DatePrompt from "inquirer-date-prompt";

inquirer.registerPrompt("date", DatePrompt);

export async function promptNewGasto() {
  return await inquirer.prompt(newGastosPrompt);
}
const newGastosPrompt = [
  {
    type: "input",
    name: "monto",
    message: "Monto:",
  },
  {
    type: "input",
    name: "descripcion",
    message: "Descripcion:",
  },
  {
    type: "date",
    name: "fecha",
    message: "Fecha:",
    locale: "en-US",
    format: { month: "short", hour: undefined, minute: undefined },
  },
  {
    type: "input",
    name: "categoria",
    message: "Categoria:",
  },
];
