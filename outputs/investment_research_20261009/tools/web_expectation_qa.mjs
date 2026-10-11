import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const bundlePath = path.join(root, 'data/research_bundle.json');
const helperPath = path.join(root, 'web/scenario-math.js');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const [bundleBytes, helperBytes, dataBytes] = await Promise.all([
  fs.readFile(bundlePath), fs.readFile(helperPath), fs.readFile(path.join(root, 'web/data.js'))
]);
const bundle = JSON.parse(bundleBytes.toString('utf8'));
const ctx = { window: {} };
vm.runInNewContext(helperBytes.toString('utf8'), ctx);
vm.runInNewContext(dataBytes.toString('utf8'), ctx);
const math = ctx.window.RESEARCH_MATH;
const data = ctx.window.RESEARCH;
const commonJS = createRequire(import.meta.url)(helperPath);
const tolerance = 1e-9;
const presets = {
  default: [25, 50, 25],
  defensive: [40, 50, 10],
  positive: [10, 50, 40],
  equal: [100 / 3, 100 / 3, 100 / 3],
  bearOnly: [100, 0, 0],
  baseOnly: [0, 100, 0],
  bullOnly: [0, 0, 100],
  noBase: [50, 0, 50]
};
let checks = 0;
let checkedSecurityHorizons = 0;
let checkedWeightedSummaries = 0;
const errors = [];
const assert = (condition, label) => {
  checks++;
  if (!condition) errors.push(label);
};
const close = (actual, expected, label) => assert(
  Number.isFinite(actual) && Number.isFinite(expected)
    && Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), label
);
const within = (actual, values, label) => assert(
  actual >= Math.min(...values) - tolerance * Math.max(1, Math.abs(actual))
    && actual <= Math.max(...values) + tolerance * Math.max(1, Math.abs(actual)), label
);

assert(bundle.models.length === 91, '91 frozen ranked securities');
assert(bundle.conditionedModels.length === 5, '5 frozen conditional securities');
assert(data.fingerprint === bundle.fingerprint, 'web data frozen fingerprint');
assert(math.validateWeights([25, 50, 25]), 'default valid weights');
assert(math.validateWeights([100 / 3, 100 / 3, 100 / 3]), 'fractional equal weights');
assert(math.validateWeights([25 + 1e-9, 50, 25]), 'sum tolerance accepted');
for (const [id, weights] of Object.entries(presets)) assert(math.validateWeights(weights), id + ' valid weights');

for (const model of bundle.models) {
  const security = data.securities.find(value => value.securityId === model.securityId);
  assert(Boolean(security) && !security.conditional, model.securityId + ' ranked web security');
  if (!security) continue;
  for (const horizon of math.HORIZONS) {
    checkedSecurityHorizons++;
    const frozen = model.scenarios[horizon];
    const defaultSummary = math.scenarioSummary(security, horizon);
    const label = model.securityId + ' ' + horizon;
    assert(Boolean(defaultSummary), label + ' default defined');
    if (!defaultSummary || !frozen) continue;
    close(defaultSummary.expectedPrice, frozen.expectedPrice, label + ' frozen default expectation');
    close(math.scenarioSummary(security, horizon, presets.defensive).expectedPrice,
      frozen.defensivePrice, label + ' frozen defensive expectation');
    close(math.scenarioSummary(security, horizon, presets.positive).expectedPrice,
      frozen.positivePrice, label + ' frozen positive expectation');
    const equalPrice = (frozen.cases[0].price + frozen.cases[1].price + frozen.cases[2].price) / 3;
    close(defaultSummary.equalWeightPrice, equalPrice, label + ' unweighted arithmetic mean');
    close(defaultSummary.equalWeightReturn, equalPrice / model.price - 1, label + ' unweighted price return');

    for (const [preset, weights] of Object.entries(presets)) {
      checkedWeightedSummaries++;
      const summary = math.scenarioSummary(security, horizon, weights);
      const stamp = label + ' ' + preset;
      assert(Boolean(summary), stamp + ' valid summary');
      if (!summary) continue;
      within(summary.expectedPrice, frozen.cases.map(value => value.price), stamp + ' price convex bound');
      within(summary.expectedDividend, frozen.cases.map(value => value.dividend), stamp + ' dividend convex bound');
      within(summary.expectedTotalReturn, frozen.cases.map(value => value.totalReturn), stamp + ' return convex bound');
      close(summary.priceReturn, summary.expectedPrice / model.price - 1, stamp + ' price return identity');
      close(summary.expectedTotalReturn, (summary.expectedPrice + summary.expectedDividend) / model.price - 1,
        stamp + ' dividend total return identity');
      close(summary.totalReturn, summary.expectedTotalReturn, stamp + ' total alias');
      const upPercent = frozen.cases.reduce((sum, value, index) => sum + (value.price > model.price ? weights[index] : 0), 0);
      close(summary.upWeightPercent, upPercent, stamp + ' discrete hypothetical positive weight');
      assert(summary.upWeight >= 0 && summary.upWeight <= 1 + tolerance, stamp + ' probability bounds');
      assert(summary.probabilityBasis === 'discrete-hypothetical-scenarios', stamp + ' hypothetical basis');
      const years = horizon === 'threeYear' ? 3 : horizon === 'fiveYear' ? 5 : null;
      if (years) close(Math.pow(1 + summary.annualizedExpectedTotal, years), 1 + summary.expectedTotalReturn,
        stamp + ' annualization inverse');
      else assert(summary.annualizedExpectedTotal === null, stamp + ' no short-horizon annualization');
      assert(JSON.stringify(summary) === JSON.stringify(commonJS.scenarioSummary(security, horizon, weights)), stamp + ' CommonJS/VM parity');
      const selected = weights.findIndex(value => value === 100);
      if (selected >= 0) {
        close(summary.expectedPrice, frozen.cases[selected].price, stamp + ' single case price');
        close(summary.expectedDividend, frozen.cases[selected].dividend, stamp + ' single case dividend');
        close(summary.expectedTotalReturn, frozen.cases[selected].totalReturn, stamp + ' single case total');
      }
    }
  }
}

const sample = data.securities.find(value => !value.conditional);
const horizon = 'oneYear';
const clone = value => JSON.parse(JSON.stringify(value));
const invalidWeights = [null, [], [25, 50], [25, 50, 25, 0], [25, 50, 24], [-1, 51, 50],
  [NaN, 50, 50], [Infinity, 0, 0], ['25', 50, 25], [25 + 1e-6, 50, 25]];
for (const [index, weights] of invalidWeights.entries()) {
  assert(!math.validateWeights(weights), 'invalid weights ' + index);
  assert(math.scenarioSummary(sample, horizon, weights) === null, 'invalid weights null ' + index);
}
for (const security of data.securities.filter(value => value.conditional)) {
  for (const h of math.HORIZONS) assert(math.scenarioSummary(security, h) === null, security.securityId + ' conditional ' + h);
}
for (const model of bundle.conditionedModels) {
  for (const h of math.HORIZONS) assert(math.scenarioSummary(model, h) === null, model.securityId + ' missing frozen conditional ' + h);
}
assert(math.scenarioSummary(null, horizon) === null, 'null security');
assert(math.scenarioSummary(sample, 'unknown') === null, 'unknown horizon');
assert(math.scenarioSummary({ ...sample, scenarios: {} }, horizon) === null, 'missing horizon');
assert(math.scenarioSummary({ ...sample, conditional: true }, horizon) === null, 'conditional even with cases');
for (const price of [null, 0, -1, Infinity, NaN, '10']) {
  assert(math.scenarioSummary({ ...sample, price }, horizon) === null, 'invalid base price ' + String(price));
}
for (const count of [0, 1, 2, 4]) {
  const value = clone(sample);
  value.scenarios[horizon].cases = Array.from({ length: count }, () => ({ ...sample.scenarios[horizon].cases[0] }));
  assert(math.scenarioSummary(value, horizon) === null, 'case count ' + count);
}
for (const key of ['price', 'dividend', 'priceReturn', 'totalReturn']) {
  for (const value of [null, undefined, NaN, Infinity, '0']) {
    const corrupted = clone(sample);
    corrupted.scenarios[horizon].cases[0][key] = value;
    assert(math.scenarioSummary(corrupted, horizon) === null, 'invalid case ' + key + ' ' + String(value));
    assert(math.scenarioSummary(corrupted, horizon, [0, 100, 0]) === null, 'invalid zero-weight case ' + key + ' ' + String(value));
  }
}
for (const key of ['price', 'dividend']) {
  const value = clone(sample);
  value.scenarios[horizon].cases[0][key] = -1;
  assert(math.scenarioSummary(value, horizon) === null, 'negative case ' + key);
}
for (const key of ['priceReturn', 'totalReturn']) {
  const value = clone(sample);
  value.scenarios[horizon].cases[0][key] += 0.1;
  assert(math.scenarioSummary(value, horizon) === null, 'misaligned ' + key);
}
const reordered = clone(sample);
reordered.scenarios[horizon].cases.reverse();
const reorderedSummary = math.scenarioSummary(reordered, horizon, [100, 0, 0]);
close(reorderedSummary.expectedPrice, sample.scenarios[horizon].cases[2].price, 'case order respected without price sort');
const sourceBefore = JSON.stringify(sample);
const weights = [25, 50, 25];
const summary = math.scenarioSummary(sample, horizon, weights);
summary.weightsPercent[0] = 0;
assert(weights[0] === 25, 'output weight copy');
assert(JSON.stringify(sample) === sourceBefore, 'source security not mutated');
assert(hash(await fs.readFile(bundlePath)) === hash(bundleBytes), 'frozen bundle unchanged');

const report = {
  fingerprint: bundle.fingerprint,
  bundleSHA256: hash(bundleBytes),
  helperSHA256: hash(helperBytes),
  webDataSHA256: hash(dataBytes),
  qaScriptSHA256: hash(await fs.readFile(import.meta.filename)),
  passed: errors.length === 0,
  checks,
  rankedSecurities: bundle.models.length,
  conditionalSecurities: bundle.conditionedModels.length,
  horizons: Array.from(math.HORIZONS),
  checkedSecurityHorizons,
  checkedWeightedSummaries,
  weights: presets,
  tolerance,
  errors,
  scope: 'Frozen expected/defensive/positive prices; 91 securities × 5 horizons; four probability presets and zero/extreme weights; convex bounds; dividend/return identities; discrete hypothetical positive weight; long-horizon annualization; invalid/conditional null boundaries; VM/CommonJS parity; no source mutation'
};
await fs.writeFile(path.join(root, 'qa/web_expectation_qa.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
if (errors.length) process.exit(1);
