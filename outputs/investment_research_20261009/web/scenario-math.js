(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RESEARCH_MATH = api;
}(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const WEIGHT_TOLERANCE = 1e-8;
  const DEFAULT_WEIGHTS = Object.freeze([25, 50, 25]);
  const HORIZONS = Object.freeze(['yearEnd', 'halfYear', 'oneYear', 'threeYear', 'fiveYear']);

  function validateWeights(weightsPercent) {
    return Array.isArray(weightsPercent)
      && weightsPercent.length === 3
      && weightsPercent.every(value => Number.isFinite(value) && value >= 0)
      && Math.abs(weightsPercent.reduce((sum, value) => sum + value, 0) - 100) <= WEIGHT_TOLERANCE;
  }

  function aligned(actual, expected) {
    return Math.abs(actual - expected) <= WEIGHT_TOLERANCE * Math.max(1, Math.abs(expected));
  }

  function scenarioSummary(security, horizon, weightsPercent = DEFAULT_WEIGHTS) {
    if (!validateWeights(weightsPercent) || !security || security.conditional
      || !HORIZONS.includes(horizon) || !Number.isFinite(security.price) || security.price <= 0) return null;
    const scenario = security.scenarios && security.scenarios[horizon];
    const cases = scenario && scenario.cases;
    if (!Array.isArray(cases) || cases.length !== 3) return null;
    const basePrice = security.price;
    if (cases.some(value => !value
      || !['price', 'dividend', 'priceReturn', 'totalReturn'].every(key => Number.isFinite(value[key]))
      || value.price < 0 || value.dividend < 0 || value.priceReturn < -1 || value.totalReturn < -1
      || !aligned(value.priceReturn, value.price / basePrice - 1)
      || !aligned(value.totalReturn, (value.price + value.dividend) / basePrice - 1))) return null;

    // The frozen case order is pessimistic, base, optimistic. It must not be sorted by price.
    // Normalize only the accepted floating-point tolerance so probabilities sum to exactly one.
    const weightSum = weightsPercent.reduce((sum, value) => sum + value, 0);
    const weights = weightsPercent.map(value => value / weightSum);
    const weighted = key => cases.reduce((sum, value, index) => sum + value[key] * weights[index], 0);
    const expectedPrice = weighted('price');
    const expectedDividend = weighted('dividend');
    const expectedTotalReturn = weighted('totalReturn');
    const equalWeightPrice = cases.reduce((sum, value) => sum + value.price, 0) / 3;
    const equalWeightTotalReturn = cases.reduce((sum, value) => sum + value.totalReturn, 0) / 3;
    const upWeight = cases.reduce((sum, value, index) => sum + (value.priceReturn > 0 ? weights[index] : 0), 0);
    const years = horizon === 'threeYear' ? 3 : horizon === 'fiveYear' ? 5 : null;
    const annualizedExpectedTotal = years === null ? null : Math.pow(1 + expectedTotalReturn, 1 / years) - 1;
    const result = {
      weightsPercent: weightsPercent.slice(),
      expectedPrice,
      priceReturn: expectedPrice / basePrice - 1,
      expectedTotalReturn,
      totalReturn: expectedTotalReturn,
      expectedDividend,
      equalWeightPrice,
      equalWeightReturn: equalWeightPrice / basePrice - 1,
      equalWeightTotalReturn,
      upWeight,
      upWeightPercent: upWeight * 100,
      annualizedExpectedTotal,
      // A sum of user-assigned weights of three hypothetical outcomes, not a statistical forecast.
      probabilityBasis: 'discrete-hypothetical-scenarios'
    };
    return Object.values(result).some(value => typeof value === 'number' && !Number.isFinite(value)) ? null : result;
  }

  return Object.freeze({ validateWeights, scenarioSummary, DEFAULT_WEIGHTS, HORIZONS });
}));
