const expect = require('chai').expect,
  inputFixture = {
    "machine": {
      "outlets": {
        "count_n": 3
      },
      "total_items_quantity": {
        "hot_water": 500,
        "hot_milk": 500,
        "ginger_syrup": 100,
        "sugar_syrup": 110, // This has been changed from the input given in the assignment
        "tea_leaves_syrup": 100
      },
      "beverages": {
        "hot_tea": {
          "hot_water": 200,
          "hot_milk": 100,
          "ginger_syrup": 10,
          "sugar_syrup": 10,
          "tea_leaves_syrup": 30
        },
        "hot_coffee": {
          "hot_water": 100,
          "ginger_syrup": 30,
          "hot_milk": 400,
          "sugar_syrup": 50,
          "tea_leaves_syrup": 30
        },
        "black_tea": {
          "hot_water": 300,
          "ginger_syrup": 30,
          "sugar_syrup": 50,
          "tea_leaves_syrup": 30
        },
        "green_tea": {
          "hot_water": 100,
          "ginger_syrup": 30,
          "sugar_syrup": 50,
          "green_mixture": 30
        },
      }
    },
  },
  CHECK_PROCESS_STATUS_INTERVAL = 30, // 30 milisecon
  CoffeeMachine = require('../src/coffeeMachine'),
  deepClone = object => JSON.parse(JSON.stringify(object));

describe('CoffeeMachine class', function () {
  let machineDetails, outletCount, ingredients, beverages;

  beforeEach(function () {
    machineDetails = deepClone(inputFixture.machine), // Creating a deep clone of fixture
    outletCount = machineDetails.outlets.count_n,
    ingredients = machineDetails.total_items_quantity,
    beverages = machineDetails.beverages;
  });

  it('Should be able to dispense the correct beverage', function (done) {
    const coffeeMachineInstance = new CoffeeMachine(outletCount, ingredients, beverages);

    coffeeMachineInstance.dispenseBeverage('black_tea')
      .then((response) => {
        expect(response).to.be.equal('black_tea is prepared');

        return done();
      })
      .catch(done);
  });

  it('Should return error if trying to dispense invalid beverage', function (done) {
    const coffeeMachineInstance = new CoffeeMachine(outletCount, ingredients, beverages);

    coffeeMachineInstance.dispenseBeverage('not_a_beverage')
      .then(() => {
        return done(new Error('Invalid beverage dispensed'));
      })
      .catch((err) => {
        expect(err.message).to.be.equal('Dispensing not_a_beverage is not supported.')

        return done();
      });
  });

  it('Should be able to dispense 3 beverages concurrently', function (done) {
    const coffeeMachineInstance = new CoffeeMachine(outletCount, ingredients, beverages);

    let finishedProcessing = 0,
      failedProcessing = 0,
      processingError = {};

    coffeeMachineInstance.dispenseBeverage('green_tea')
      .then((response) => {
        expect(response).to.be.equal('green_tea is prepared');

        finishedProcessing += 1;
      })
      .catch((err) => {
        failedProcessing += 1;
        processingError.green_tea = err;
      });

    coffeeMachineInstance.dispenseBeverage('hot_tea')
      .then((response) => {
        expect(response).to.be.equal('hot_tea is prepared');

        finishedProcessing += 1;
      })
      .catch((err) => {
        failedProcessing += 1;
        processingError.hot_tea = err;
      });

    coffeeMachineInstance.dispenseBeverage('hot_coffee')
      .then((response) => {
        expect(response).to.be.equal('hot_coffee is prepared');

        finishedProcessing += 1;
      })
      .catch((err) => {
        failedProcessing += 1;
        processingError.hot_coffee = err;
      });

    // Check whether all beverages are dispensed
    // then assert none of them failed
    const interval = setInterval(() => {
      if ((finishedProcessing + failedProcessing) === 3) {
        expect(finishedProcessing).to.be.equal(3);
        expect(failedProcessing).to.be.equal(0);
        
        clearInterval(interval);

        return done();
      }
    }, CHECK_PROCESS_STATUS_INTERVAL);
  });

  it('Should return error if trying to dispense more than 3 beverages concurrently', function (done) {
    const coffeeMachineInstance = new CoffeeMachine(outletCount, ingredients, beverages);

    let finishedProcessing = 0,
      failedProcessing = 0,
      processingError = {};

    coffeeMachineInstance.dispenseBeverage('green_tea')
      .then((response) => {
        expect(response).to.be.equal('green_tea is prepared');

        finishedProcessing += 1;
      })
      .catch((err) => {
        failedProcessing += 1;
        processingError.green_tea = err;
      });

    coffeeMachineInstance.dispenseBeverage('hot_tea')
      .then((response) => {
        expect(response).to.be.equal('hot_tea is prepared');

        finishedProcessing += 1;
      })
      .catch((err) => {
        failedProcessing += 1;
        processingError.hot_tea = err;
      });

    coffeeMachineInstance.dispenseBeverage('hot_coffee')
      .then((response) => {
        expect(response).to.be.equal('hot_coffee is prepared');

        finishedProcessing += 1;
      })
      .catch((err) => {
        failedProcessing += 1;
        processingError.hot_coffee = err;
      });

    coffeeMachineInstance.dispenseBeverage('hot_coffee')
      .then((response) => {
        expect(response).to.be.equal('hot_coffee is prepared');

        finishedProcessing += 1;
      })
      .catch((err) => {
        failedProcessing += 1;
        processingError.hot_coffee1 = err;
      });

    const interval = setInterval(() => {
      if ((finishedProcessing + failedProcessing) === 4) {
        expect(failedProcessing).to.be.equal(1);

        for (const processName in processingError) {
          expect(processingError[processName].message).to.be.equal('Can\'t dispense more than 3 beverages at a time');
        }
        
        clearInterval(interval);

        return done();
      }
    }, CHECK_PROCESS_STATUS_INTERVAL)
  });

  it('Should return error if enough ingredient is not available to prepare a beverage', function (done) {
    const coffeeMachineInstance = new CoffeeMachine(outletCount, ingredients, beverages);

    coffeeMachineInstance.dispenseBeverage('green_tea')
      .then((response) => {
        expect(response).to.be.equal('green_tea is prepared');

        return coffeeMachineInstance.dispenseBeverage('hot_tea');
      })
      .then((response) => {
        expect(response).to.be.equal('hot_tea is prepared');

        return coffeeMachineInstance.dispenseBeverage('hot_coffee');
      })
      .then((response) => {
        expect(response).to.be.equal('hot_coffee is prepared');

        return coffeeMachineInstance.dispenseBeverage('black_tea');
      })
      .then((response) => {
        // This should not be called as black_tea preparation should fail
        expect(response).to.be.empty;

        return done();
      })
      .catch((err) => {
        expect(err.message).to.be.equal('Dispensing black_tea is not possible because hot_water is not available');

        return done();
      });
  });

  it('Should refill ingredient correctly and let dispense beverage after refill', function (done) {
    const coffeeMachineInstance = new CoffeeMachine(outletCount, ingredients, beverages);

    coffeeMachineInstance.dispenseBeverage('green_tea')
      .then((response) => {
        expect(response).to.be.equal('green_tea is prepared');

        return coffeeMachineInstance.dispenseBeverage('hot_tea');
      })
      .then((response) => {
        expect(response).to.be.equal('hot_tea is prepared');

        return coffeeMachineInstance.dispenseBeverage('hot_coffee');
      })
      .then((response) => {
        expect(response).to.be.equal('hot_coffee is prepared');

        return coffeeMachineInstance.dispenseBeverage('black_tea');
      })
      .then((response) => {
        // This should not be called as black_tea preparation should fail
        expect(response).to.be.empty;

        return done(new Error('black_tea shouldn\'t have been prepared'));
      })
      // refill hot_water 300 quantity when black_tea preparataion fails
      .catch((err) => {
        expect(err.message).to.be.equal('Dispensing black_tea is not possible because hot_water is not available');

        // refill hot_water 300 quantity
        return coffeeMachineInstance.refillIngredient('hot_water', 300);
      })
      .then(() => coffeeMachineInstance.dispenseBeverage('black_tea'))
      .then((response) => {
        expect(response).to.be.equal('black_tea is prepared');

        return done();
      })
      .catch(done);
  });
});
