import { TronWeb } from "tronweb";
import { TRON_GRID_API } from "./config/tronConfig.js";

const subAccountTronWebConfig = new TronWeb({
    fullHost: TRON_GRID_API,
    privateKey: "F5C3F9603D9EBD99E3B9CA1AD8C850627C6739B75A23FC3B06F71CCC400D235F",
  });

  let energyPrices = await subAccountTronWebConfig.trx.getEnergyPrices();

  console.log("Type of energy Prices", typeof energyPrices , "\n Energy prices ", energyPrices)
  
  console.log("Splitted energy prices" , ((energyPrices.split(",")[energyPrices.split(",").length-1]).toString()).split(":")[1])
 
  const splittedEnergyPrices = energyPrices.split(",");



