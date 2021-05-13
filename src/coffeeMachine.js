const TIME_TO_PREPARE_BEVERAGE = 20, // 20 Milisecond
  TIME_TO_REFILL_INGREDIENT = 20; // 20 Milisecond

// Promisify setTimeout
const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

class CoffeeMachine {
  #availabelOutletCount = 0;
  #ingredients = {};
  #possibleBeverages = {};
  #parallellyDispensingOutletCount = 0;

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

  dispenseBeverage (beverageName) {
    const beverageDetails = this.#possibleBeverages[beverageName],
      areAllOutletsDispensing = this.#availabelOutletCount <= this.#parallellyDispensingOutletCount;

    if (areAllOutletsDispensing) {
      return Promise.reject(new Error(`Can't dispense more than ${this.#availabelOutletCount} beverages at a time`));
    }

    this.#parallellyDispensingOutletCount += 1;
    
    if (!beverageDetails) {
      return Promise.reject(new Error(`Dispensing ${beverageName} is not supported.`));
    }

    // Simulating preparing of beverage by waiting for 20 milisecond
    return delay(TIME_TO_PREPARE_BEVERAGE).then(() => {
      for (const ingredientName in beverageDetails) {
        const availableIngredient = this.#ingredients[ingredientName],
          requiredIngredient = beverageDetails[ingredientName];

        if (!availableIngredient || availableIngredient < requiredIngredient) {
          return Promise.reject(new Error(`Dispensing ${beverageName} is not possible because ${ingredientName} is not available`));
        }

        this.reduceIngredient(ingredientName, requiredIngredient);

        this.#parallellyDispensingOutletCount -= 1;

        return Promise.resolve(`${beverageName} is prepared`);
      }
    });
  }
};

module.exports = CoffeeMachine;
