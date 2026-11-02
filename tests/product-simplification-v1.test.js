import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');

test('simplified product shell is loaded from the versioned bootstrap', () => {
  const index = read('index.html');
  const bootstrap = read('app-bootstrap.js');
  assert.ok(index.includes('app-bootstrap.js?v=63'));
  assert.ok(bootstrap.includes("const V='63'"));
  assert.ok(bootstrap.includes('product-simplification-v1.js?v=${V}'));
  assert.ok(bootstrap.includes('product-simplification-v1.css?v=${V}'));
});

test('primary navigation consolidates the app into four sections', () => {
  const source = read('product-simplification-v1.js');
  for (const page of ['today', 'plan', 'projects', 'english']) {
    assert.ok(source.includes('data-page="'+page+'"'), 'missing desktop destination: ' + page);
  }
  assert.ok(source.includes("id:'page-plan'"));
  assert.ok(source.includes("id:'page-projects'"));
  assert.ok(source.includes("page-calendar"));
  assert.ok(source.includes("page-tasks"));
  assert.ok(source.includes("page-work"));
  assert.ok(source.includes("page-creative"));
  assert.ok(source.includes("data-product-plan-view"));
  assert.ok(source.includes("data-product-project-view"));
});

test('Gym and Food are removed from normal navigation and dashboard UI', () => {
  const source = read('product-simplification-v1.js');
  const app = read('app.js');
  const dashboard = read('dashboard-v2.js');
  assert.ok(source.includes("by('page-fitness')?.classList.add('hidden')"));
  assert.ok(source.includes("querySelector('[data-page=\"fitness\"]')?.remove()"));
  assert.doesNotMatch(app, /Promise\.all\(\[loadWater\(\),loadMeals\(\),loadWorkouts\(\)/);
  assert.doesNotMatch(dashboard, /from\('(water_logs|meals|workouts)'\)/);
});

test('normal workspace refresh no longer loads nutrition data or targets', () => {
  const app = read('app.js');
  const v5 = read('serag-v5.js');
  const refreshAll = app.slice(app.indexOf('async function refreshAll(){'), app.indexOf('\n}', app.indexOf('async function refreshAll(){')) + 2);
  const refreshV5 = v5.slice(v5.indexOf('async function refreshV5(){'), v5.indexOf('\n  }', v5.indexOf('async function refreshV5(){')) + 4);
  const command = v5.slice(v5.indexOf('async function loadCommandCenter(){'), v5.indexOf('function commandStat', v5.indexOf('async function loadCommandCenter(){')));
  assert.doesNotMatch(refreshAll, /loadWater|loadMeals|loadWorkouts/);
  assert.doesNotMatch(refreshV5, /loadNutrition/);
  assert.doesNotMatch(command, /from\('(meals|water_logs|workouts)'\)/);
  assert.doesNotMatch(v5, /select\('display_name,calorie_target,protein_target,water_target'\)/);
});

test('legacy records are preserved; no destructive health-data migration is introduced', () => {
  const source = read('product-simplification-v1.js');
  assert.doesNotMatch(source, /\.from\('(meals|meal_items|water_logs|workouts|food_catalog)'\)\.(delete|upsert)/);
  assert.doesNotMatch(source, /DROP TABLE|DELETE FROM/i);
});
