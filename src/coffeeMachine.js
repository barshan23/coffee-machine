const TIME_TO_PREPARE_BEVERAGE = 20, // 20 Milisecond
  TIME_TO_REFILL_INGREDIENT = 20; // 20 Milisecond

// Promisify setTimeout
const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

class CoffeeMachine {
  #availabelOutletCount = 0;
  #ingredients = {};
  #possibleBeverages = {};
  #parallellyDispensingOutletCount = 0;

  /**
   * @param {Number} outletCount Number of outlet available in the machine
   * @param {Object} ingredients An object having ingredient name as key and available quanitity as value 
   * @param {Object<ingredients>} possibleBeverages An object having beverage name as key with required ingredients as value
   */
  constructor (outletCount, ingredients, possibleBeverages) {
    this.#availabelOutletCount = outletCount;
    this.#ingredients = ingredients;
    this.#possibleBeverages = possibleBeverages;
  }

  reduceIngredient (ingredientName, amountToBeReduced) {
    this.#ingredients[ingredientName] -= amountToBeReduced;
  }

  refillIngredient (ingredientName, quantity) {
    this.#ingredients[ingredientName] += quantity;

    // Simulating refilling of ingredient by waiting for 20 milisecond
    return delay(TIME_TO_REFILL_INGREDIENT).then(() => Promise.resolve());
  }

  dispenseBeverage (beverageToBeDispensed) {
    const beverageDetails = this.#possibleBeverages[beverageToBeDispensed],
      areAllOutletsDispensing = this.#availabelOutletCount <= this.#parallellyDispensingOutletCount;

    // If all of the available outlets are already dispensing then return error
    if (areAllOutletsDispensing) {
      return Promise.reject(new Error(`Can't dispense more than ${this.#availabelOutletCount} beverages at a time`));
    }

    // Block the current outlet for future despense operations
    this.#parallellyDispensingOutletCount += 1;
    
    // If invalid beverage is passed then return error
    if (!beverageDetails) {
      return Promise.reject(new Error(`Dispensing ${beverageToBeDispensed} is not supported.`));
    }

    // Simulating preparing of beverage by waiting for 20 milisecond
    return delay(TIME_TO_PREPARE_BEVERAGE).then(() => {
      for (const ingredientName in beverageDetails) {
        const availableIngredient = this.#ingredients[ingredientName],
          requiredIngredient = beverageDetails[ingredientName],
          notEnoughIngredientAvailable = !availableIngredient || availableIngredient < requiredIngredient;

        if (notEnoughIngredientAvailable) {
          return Promise.reject(new Error(`Dispensing ${beverageToBeDispensed} is not possible because ${ingredientName} is not available`));
        }

        this.reduceIngredient(ingredientName, requiredIngredient);

        // Release the current outlet for future despense operations
        this.#parallellyDispensingOutletCount -= 1;

        return Promise.resolve(`${beverageToBeDispensed} is prepared`);
      }
    });
  }
};

module.exports = CoffeeMachine;
