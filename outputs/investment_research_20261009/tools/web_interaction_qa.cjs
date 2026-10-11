'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {pathToFileURL} = require('url');
const {chromium} = require('C:/Users/happyelements/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const metrics = ['score', 'baseReturn', 'expectedReturn', 'expectedTotalReturn', 'bearReturn', 'bullReturn', 'yearEndExpectedReturn'];
const horizons = ['halfYear', 'oneYear', 'threeYear', 'fiveYear'];
const checks = [];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const near = (actual, expected, message, tolerance = 1e-9) => assert(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${message}: got ${actual}, expected ${expected}`);
const equalIDs = (actual, expected, message) => assert(actual.length === expected.length && actual.every((id, index) => id === expected[index]), `${message}: got ${actual.join(',')}, expected ${expected.join(',')}`);

(async () => {
  const root = path.resolve(__dirname, '..');
  const out = path.join(root, 'qa', 'web_enhanced');
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const screenshot = async name => page.screenshot({path: path.join(out, `${name}.png`), fullPage: false});
  const route = async hash => {
    await page.evaluate(value => { location.hash = value; }, hash);
    await page.waitForFunction(value => location.hash === value, hash);
    await page.waitForTimeout(30);
  };
  const rows = async () => page.locator('#rank-results tbody tr').evaluateAll(elements => elements.map(element => ({
    securityId: element.dataset.security,
    value: Number(element.dataset.sortValue),
    officialRank: Number(element.querySelector('td')?.textContent?.trim())
  })));
  const currentWeights = async () => Promise.all(['bear', 'base', 'bull'].map(async name => Number(await page.locator(`#weight-${name}`).inputValue())));
  const normalizedWeights = async () => (await currentWeights()).map(value => value / 100);
  const assertWeights = async (expected, label) => {
    const actual = await currentWeights();
    actual.forEach((value, index) => near(value, expected[index], `${label} input ${index}`, 1e-8));
    const status = await page.locator('#scenario-weight-status').innerText();
    assert(status.includes('100'), `${label} status does not show sum 100: ${status}`);
  };
  const preset = async (value, expected) => {
    await page.locator('#weight-preset').selectOption(value);
    await page.locator('#apply-weights').click();
    await assertWeights(expected, `${value} preset`);
    checks.push(`weights:${value}`);
  };
  const modelValue = (security, ranking, horizon, metric, weights) => {
    const scenarios = security.scenarios[horizon].cases;
    const weighted = (cases, field) => cases.reduce((sum, scenario, index) => sum + weights[index] * Number(scenario[field] || 0), 0);
    if (metric === 'score') return ranking.score;
    if (metric === 'baseReturn') return ranking.baseReturn;
    if (metric === 'bearReturn') return ranking.bearReturn;
    if (metric === 'bullReturn') return scenarios[2].priceReturn;
    if (metric === 'yearEndExpectedReturn') return weighted(security.scenarios.yearEnd.cases, 'price') / security.price - 1;
    const price = weighted(scenarios, 'price');
    if (metric === 'expectedReturn') return price / security.price - 1;
    return (price + weighted(scenarios, 'dividend')) / security.price - 1;
  };
  let source;
  let securities;
  let rankings;
  const verifyRows = async (horizon, metric, direction, expectedCount = 91) => {
    const actual = await rows();
    assert(actual.length === expectedCount, `${horizon}/${metric}/${direction} row count ${actual.length}`);
    assert(new Set(actual.map(item => item.securityId)).size === actual.length, 'Duplicate security in rank rows');
    const weights = await normalizedWeights();
    for (let index = 0; index < actual.length; index++) {
      const item = actual[index];
      const security = securities.get(item.securityId);
      const ranking = rankings[horizon].get(item.securityId);
      assert(security && ranking && !security.conditional, `Conditional or unknown ranking row ${item.securityId}`);
      near(item.value, modelValue(security, ranking, horizon, metric, weights), `${horizon}/${metric} value ${item.securityId}`);
      assert(item.officialRank === ranking.rank, `Official rank changed for ${item.securityId}`);
      if (index) {
        const delta = item.value - actual[index - 1].value;
        assert(direction === 'asc' ? delta >= -1e-9 : delta <= 1e-9, `${horizon}/${metric}/${direction} is not monotonic at ${index}`);
      }
    }
    checks.push(`sort:${horizon}:${metric}:${direction}:${actual.length}`);
    return actual;
  };
  const chooseSort = async (metric, direction) => {
    await page.locator('#sort-by').selectOption(metric);
    await page.locator('#sort-direction').selectOption(direction);
  };
  const summary = async () => page.locator('#expected-summary').evaluate(element => ({
    price: Number(element.dataset.expectedPrice),
    return: Number(element.dataset.expectedReturn),
    text: element.textContent
  }));
  const verifySummary = async (securityId, horizon, label) => {
    // hash changes precede the hashchange listener; wait for the rendered horizon.
    await page.waitForFunction(({horizon: value, securityId: expectedSecurity}) => {
      const expected = document.querySelector('#expected-summary');
      const active = document.querySelector('.horizon-ribbon [data-horizon].active');
      const company = document.querySelector('.detail-nav [data-tab="overview"]');
      return expected && active?.dataset.horizon === value && company?.dataset.security === expectedSecurity;
    }, {horizon, securityId});
    const actual = await summary();
    const security = securities.get(securityId);
    const weights = await normalizedWeights();
    const expectedPrice = security.scenarios[horizon].cases.reduce((sum, scenario, index) => sum + scenario.price * weights[index], 0);
    near(actual.price, expectedPrice, `${label} expected price`);
    near(actual.return, expectedPrice / security.price - 1, `${label} expected return`);
    assert(!/NaN|Infinity|\[object Object\]/.test(actual.text), `${label} has invalid value rendering`);
    checks.push(`summary:${label}`);
    return actual;
  };
  const noOverflow = async label => {
    const layout = await page.evaluate(() => ({width: innerWidth, documentWidth: document.documentElement.scrollWidth}));
    assert(layout.documentWidth <= layout.width + 1, `${label} page overflow ${layout.documentWidth} > ${layout.width}`);
    checks.push(`layout:${label}`);
  };

  try {
    await page.goto(pathToFileURL(path.join(root, 'web', 'index.html')).href);
    await page.waitForSelector('#sort-by');
    source = await page.evaluate(() => ({securities: RESEARCH.securities, rankings: RESEARCH.rankings, fingerprint: RESEARCH.fingerprint}));
    securities = new Map(source.securities.map(security => [security.securityId, security]));
    rankings = Object.fromEntries(horizons.map(horizon => [horizon, new Map(source.rankings[horizon].map(ranking => [ranking.securityId, ranking]))]));
    assert(source.securities.filter(security => !security.conditional).length === 91, 'Expected 91 formal securities');
    await assertWeights([25, 50, 25], 'default weights');
    assert(await page.locator('#scenario-workbench').count() === 1, 'Rank scenario workbench missing');
    const options = await page.locator('#sort-by option').evaluateAll(elements => elements.map(element => element.value));
    for (const metric of metrics) assert(options.includes(metric), `Missing sort option ${metric}`);
    for (const horizon of horizons) {
      await route(`#rank/${horizon}`);
      await page.waitForSelector('#rank-results table');
      for (const metric of metrics) for (const direction of ['desc', 'asc']) {
        await chooseSort(metric, direction);
        await verifyRows(horizon, metric, direction);
      }
    }
    await chooseSort('expectedReturn', 'desc');
    await noOverflow('desktop-rank');
    await screenshot('desktop_rank_expected');
    await page.locator('#sort-by').scrollIntoViewIfNeeded();
    await screenshot('desktop_sort_results');

    // Header controls must update both the selected metric and direction.
    await page.locator('[data-column-sort="baseReturn"]').click();
    assert(await page.locator('#sort-by').inputValue() === 'baseReturn', 'Header did not select base return');
    const firstHeaderDirection = await page.locator('#sort-direction').inputValue();
    await verifyRows('fiveYear', 'baseReturn', firstHeaderDirection);
    await page.locator('[data-column-sort="baseReturn"]').click();
    const secondHeaderDirection = await page.locator('#sort-direction').inputValue();
    assert(firstHeaderDirection !== secondHeaderDirection, 'Header click did not toggle direction');
    await verifyRows('fiveYear', 'baseReturn', secondHeaderDirection);

    // Filtered rows still follow the selected metric and retain source rank numbers.
    await chooseSort('expectedReturn', 'desc');
    await page.locator('#search').fill('百济');
    const queryIDs = source.securities.filter(security => !security.conditional && `${security.name} ${security.code} ${security.sector}`.toLowerCase().includes('百济')).map(security => security.securityId);
    assert(queryIDs.length === 2, 'Source A/H query should have two securities');
    const searched = await verifyRows('fiveYear', 'expectedReturn', 'desc', queryIDs.length);
    assert(searched.every(item => queryIDs.includes(item.securityId)), 'Search leaked unrelated securities');
    await page.locator('#search').fill('');
    await page.locator('#market').selectOption('HK');
    const hkIDs = source.securities.filter(security => !security.conditional && security.code.endsWith('.HK')).map(security => security.securityId);
    const hk = await verifyRows('fiveYear', 'expectedReturn', 'desc', hkIDs.length);
    assert(hk.every(item => hkIDs.includes(item.securityId)), 'Market filter leaked A shares');
    const sectorCounts = new Map();
    for (const id of hkIDs) {
      const sector = securities.get(id).sector;
      sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1);
    }
    const sector = [...sectorCounts].sort((a, b) => b[1] - a[1])[0][0];
    await page.locator('#sector').selectOption({label: sector});
    const sectorIDs = hkIDs.filter(id => securities.get(id).sector === sector);
    const sectorRows = await verifyRows('fiveYear', 'expectedReturn', 'desc', sectorIDs.length);
    assert(sectorRows.every(item => sectorIDs.includes(item.securityId)), 'Combined market/sector filter mismatch');
    await page.locator('#sector').selectOption('');
    await page.locator('#market').selectOption('');
    const beforeTop = await rows();
    const firstTen = beforeTop.filter(item => rankings.fiveYear.get(item.securityId).topTenDistinct).map(item => item.securityId);
    await page.locator('#top').check();
    const top = await verifyRows('fiveYear', 'expectedReturn', 'desc', 10);
    assert(new Set(top.map(item => securities.get(item.securityId).issuerId)).size === 10, 'Top 10 includes duplicate issuer');
    equalIDs(top.map(item => item.securityId), firstTen, 'Recommended top 10 retain membership and follow selected ordering');
    await page.locator('#top').uncheck();
    checks.push('filters:query-market-sector-top-ten-distinct');

    // Editing probability weights changes the expected return, without changing source scenarios.
    await preset('defensive', [40, 50, 10]);
    await verifyRows('fiveYear', 'expectedReturn', 'desc');
    await page.reload();
    await page.waitForSelector('#sort-by');
    await assertWeights([40, 50, 10], 'weights after reload');
    await chooseSort('expectedReturn', 'desc');
    await verifyRows('fiveYear', 'expectedReturn', 'desc');
    checks.push('weights:reload-persistence');
    const beforeInvalid = await rows();
    const storedBeforeInvalid = await page.evaluate(() => localStorage.getItem('research-scenario-weights'));
    await page.locator('#weight-bear').fill('40');
    await page.locator('#weight-base').fill('50');
    await page.locator('#weight-bull').fill('20');
    await page.locator('#apply-weights').click();
    assert((await page.locator('#weight-error').innerText()).trim().length > 0, 'Invalid sum did not show validation error');
    const afterInvalid = await rows();
    equalIDs(afterInvalid.map(item => item.securityId), beforeInvalid.map(item => item.securityId), 'Invalid weight sum changed ranking');
    afterInvalid.forEach((item, index) => near(item.value, beforeInvalid[index].value, 'Invalid sum replaced applied weight values'));
    assert(await page.evaluate(() => localStorage.getItem('research-scenario-weights')) === storedBeforeInvalid, 'Invalid sum replaced stored weights');
    assert(!/NaN|Infinity/.test(await page.locator('#rank-results').innerText()), 'Invalid weights rendered NaN/Infinity');
    await page.locator('#weight-bear').fill('-10');
    await page.locator('#weight-base').fill('90');
    await page.locator('#weight-bull').fill('20');
    await page.locator('#apply-weights').click();
    assert((await page.locator('#weight-error').innerText()).trim().length > 0, 'Negative weight with sum 100 was accepted');
    assert(await page.evaluate(() => localStorage.getItem('research-scenario-weights')) === storedBeforeInvalid, 'Negative weight replaced stored weights');
    await page.locator('#weight-bear').fill('');
    await page.locator('#apply-weights').click();
    assert((await page.locator('#weight-error').innerText()).trim().length > 0, 'Blank weight was accepted');
    assert(await page.evaluate(() => localStorage.getItem('research-scenario-weights')) === storedBeforeInvalid, 'Blank weight replaced stored weights');
    await page.locator('#weight-bear').fill('40');
    await page.locator('#weight-base').fill('50');
    await page.locator('#weight-bull').fill('10');
    await page.locator('#apply-weights').click();
    await assertWeights([40, 50, 10], 'valid weights after rejection');
    checks.push('weights:invalid-sum-negative-blank-retain-applied-and-stored-values');

    await page.locator('[data-horizon="threeYear"]').click();
    await page.waitForURL(/#rank\/threeYear$/);
    await assertWeights([40, 50, 10], 'weights after horizon change');
    await verifyRows('threeYear', 'expectedReturn', 'desc');
    const selected = (await rows())[0].securityId;
    const selectedSecurity = securities.get(selected);
    await page.locator(`#rank-results tr[data-security="${selected}"] a`).first().click();
    await page.waitForURL(new RegExp(`#company/${selectedSecurity.issuerId}/${selected}/overview/threeYear$`));
    await page.waitForSelector('#expected-summary');
    await assertWeights([40, 50, 10], 'weights after rank/company navigation');
    await verifySummary(selected, 'threeYear', 'defensive-three-year');
    await noOverflow('desktop-company');
    await screenshot('desktop_company_defensive');
    await page.locator('#expected-summary').scrollIntoViewIfNeeded();
    await screenshot('desktop_expected_summary');
    await page.locator('[data-tab="research"]').click();
    await page.waitForSelector('.reading');
    assert(page.url().endsWith('/research/threeYear'), 'Research tab lost horizon');
    await page.locator('[data-tab="sources"]').click();
    await page.waitForSelector('#detail-body .panel');
    assert(page.url().endsWith('/sources/threeYear'), 'Sources tab lost horizon');
    await page.locator('[data-tab="overview"]').click();
    await page.waitForSelector('#expected-summary');
    await assertWeights([40, 50, 10], 'weights after company tabs');
    await verifySummary(selected, 'threeYear', 'defensive-after-tabs');
    await page.locator('[data-horizon="halfYear"]').click();
    await page.waitForURL(/\/overview\/halfYear$/);
    await assertWeights([40, 50, 10], 'weights after company horizon');
    await verifySummary(selected, 'halfYear', 'defensive-half-year');
    await preset('positive', [10, 50, 40]);
    await verifySummary(selected, 'halfYear', 'positive-half-year');
    await page.locator('#weight-preset').selectOption('equal');
    await page.locator('#apply-weights').click();
    const equal = await currentWeights();
    near(equal.reduce((sum, value) => sum + value, 0), 100, 'Equal sum', 1e-8);
    equal.forEach(value => near(value, 100 / 3, 'Equal thirds', 0.0006));
    await verifySummary(selected, 'halfYear', 'equal-half-year');
    checks.push('weights:equal');
    await preset('default', [25, 50, 25]);
    await verifySummary(selected, 'halfYear', 'default-half-year');

    // A/H listing navigation must retain the selected horizon and active weights.
    const multiIssuer = source.securities.find(security => !security.conditional && source.securities.some(other => other.issuerId === security.issuerId && other.securityId !== security.securityId && !other.conditional));
    await route(`#company/${multiIssuer.issuerId}/${multiIssuer.securityId}/overview/fiveYear`);
    await page.waitForSelector('#expected-summary');
    const alternate = source.securities.find(security => security.issuerId === multiIssuer.issuerId && security.securityId !== multiIssuer.securityId && !security.conditional);
    await page.locator(`.listing-tabs a[href="#company/${alternate.issuerId}/${alternate.securityId}/overview/fiveYear"]`).click();
    await page.waitForURL(new RegExp(`#company/${alternate.issuerId}/${alternate.securityId}/overview/fiveYear$`));
    await verifySummary(alternate.securityId, 'fiveYear', 'alternate-listing');
    checks.push('routes:rank-company-tabs-horizons-listings');

    // Conditional securities must have neither formal expected values nor rank rows.
    for (const conditional of source.securities.filter(security => security.conditional)) {
      await route(`#company/${conditional.issuerId}/${conditional.securityId}/overview/fiveYear`);
      await page.waitForSelector('#detail-body .notice');
      assert(await page.locator('#expected-summary').count() === 0, `Conditional expected value leak ${conditional.securityId}`);
      assert(await page.locator('.scenario-cases').count() === 0, `Conditional formal scenarios leak ${conditional.securityId}`);
      assert(!/NaN|Infinity/.test(await page.locator('#detail-body').innerText()), `Conditional invalid numbers ${conditional.securityId}`);
    }
    await screenshot('desktop_conditional');
    checks.push('conditional:all-five-excluded');

    // Expected comparison rows are present and responsive for applied weights.
    const comparisonIDs = [selected, alternate.securityId].filter((id, index, items) => items.indexOf(id) === index);
    for (const id of comparisonIDs) {
      const security = securities.get(id);
      await route(`#company/${security.issuerId}/${id}/overview/oneYear`);
      await page.waitForSelector('#expected-summary');
      await page.locator(`[data-compare="${id}"]`).click();
    }
    await route('#compare/oneYear');
    await page.waitForSelector('main table');
    const expectedComparisonRows = await page.locator('main tbody tr').filter({hasText: /期望.*回报|期望.*价/}).count();
    assert(expectedComparisonRows >= 2, 'Comparison expected price/return rows missing');
    assert(!/NaN|Infinity|\[object Object\]/.test(await page.locator('main').innerText()), 'Comparison invalid numbers');
    const verifyComparison = async label => {
      const weights = await normalizedWeights();
      const cellsFor = async text => page.locator('main tbody tr').filter({has: page.locator('td').first().filter({hasText: text})}).locator('td').allTextContents();
      const priceCells = await cellsFor(/^加权期望价格$/);
      const returnCells = await cellsFor(/^加权期望涨跌幅$/);
      assert(priceCells.length === comparisonIDs.length + 1 && returnCells.length === comparisonIDs.length + 1, 'Comparison expected column count');
      const numeric = text => Number(text.match(/[+-]?\d[\d,]*(?:\.\d+)?/)?.[0].replace(/,/g, ''));
      for (let index = 0; index < comparisonIDs.length; index++) {
        const security = securities.get(comparisonIDs[index]);
        const expectedPrice = security.scenarios.oneYear.cases.reduce((sum, scenario, caseIndex) => sum + scenario.price * weights[caseIndex], 0);
        assert(Math.abs(numeric(priceCells[index + 1]) - expectedPrice) <= 0.0051, `${label} comparison rounded price ${security.securityId}`);
        assert(Math.abs(numeric(returnCells[index + 1]) / 100 - (expectedPrice / security.price - 1)) <= 0.000051, `${label} comparison rounded return ${security.securityId}`);
      }
      checks.push(`comparison:${label}`);
    };
    await verifyComparison('default');
    await preset('defensive', [40, 50, 10]);
    await verifyComparison('defensive');
    await preset('default', [25, 50, 25]);
    await noOverflow('desktop-compare');
    await screenshot('desktop_compare');
    checks.push('comparison:expected-value-rows');

    // Page width stays fixed; wide data tables may scroll within their own wrapper.
    await page.setViewportSize({width: 390, height: 844});
    await route('#rank/oneYear');
    await page.waitForSelector('#sort-by');
    await chooseSort('expectedTotalReturn', 'desc');
    await verifyRows('oneYear', 'expectedTotalReturn', 'desc');
    await noOverflow('mobile-rank');
    await screenshot('mobile_rank_expected');
    await page.locator('#sort-by').scrollIntoViewIfNeeded();
    await screenshot('mobile_sort_results');
    await route(`#company/${selectedSecurity.issuerId}/${selected}/overview/oneYear`);
    await page.waitForSelector('#expected-summary');
    await noOverflow('mobile-company');
    await screenshot('mobile_company');
    await page.locator('#expected-summary').scrollIntoViewIfNeeded();
    await screenshot('mobile_expected_summary');
    await page.locator('[data-tab="research"]').click();
    await page.waitForSelector('.reading');
    await noOverflow('mobile-research');
    await screenshot('mobile_research');
    await route('#compare/oneYear');
    await page.waitForSelector('main table');
    await noOverflow('mobile-compare');
    await screenshot('mobile_compare');

    assert(errors.length === 0, `JavaScript errors: ${errors.join('\n')}`);
    const inputSHA256 = Object.fromEntries(['web/index.html', 'web/app.js', 'web/style.css', 'web/data.js', 'web/scenario-math.js'].map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]));
    const report = {passed: true, fingerprint: source.fingerprint, inputSHA256, checks, rankingRows: 91, sortMetrics: metrics, horizons, errors, offlineFileProtocol: true, screenshots: fs.readdirSync(out).filter(file => file.endsWith('.png'))};
    fs.writeFileSync(path.join(root, 'qa', 'web_interaction_qa.json'), JSON.stringify(report, null, 2));
    console.log(`Web interaction QA passed: ${checks.length} checks, ${metrics.length} metrics across ${horizons.length} horizons.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
