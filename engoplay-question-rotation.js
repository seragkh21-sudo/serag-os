/* EngoPlay question rotation: deterministic sessions + local spaced repetition. */
(function (root) {
  'use strict';

  var STATS_KEY = 'engoplay_qstats_v1';
  var SEED_KEY = 'engoplay_session_seed_v1';
  var QUESTIONS_KEY = 'engoplay_session_questions_v1';
  var MINUTE = 60 * 1000;
  var DAY = 24 * 60 * MINUTE;
  var memory = { seed: null, stats: null, cache: null };

  function storage(name) {
    try { return root[name] || null; } catch (_) { return null; }
  }
  function readJson(store, key, fallback) {
    try {
      if (!store) return fallback;
      var raw = store.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }
  function writeJson(store, key, value) {
    try {
      if (!store) return false;
      store.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) { return false; }
  }
  function removeKey(store, key) {
    try { if (store) store.removeItem(key); } catch (_) {}
  }
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function createSeed() {
    try {
      var cryptoApi = root.crypto;
      if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
        var values = new Uint32Array(2);
        cryptoApi.getRandomValues(values);
        return values[0].toString(36) + '-' + values[1].toString(36);
      }
    } catch (_) {}
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
  }

  /* xmur3 string hash and mulberry32 PRNG. */
  function xmur3(value) {
    var h = 1779033703 ^ String(value).length;
    for (var i = 0; i < String(value).length; i += 1) {
      h = Math.imul(h ^ String(value).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }
  function mulberry32(seed) {
    return function () {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rng(seed) {
    return mulberry32(xmur3(seed)());
  }
  function shuffle(rows, seed) {
    var list = Array.isArray(rows) ? rows.slice() : [];
    var random = rng(seed);
    for (var i = list.length - 1; i > 0; i -= 1) {
      var j = Math.floor(random() * (i + 1));
      var temp = list[i];
      list[i] = list[j];
      list[j] = temp;
    }
    return list;
  }
  function currentSeed() {
    var store = storage('sessionStorage');
    var saved = null;
    try { saved = store && store.getItem(SEED_KEY); } catch (_) {}
    if (saved) {
      memory.seed = String(saved);
      return memory.seed;
    }
    if (!memory.seed) memory.seed = createSeed();
    writeJson(store, SEED_KEY, memory.seed);
    return memory.seed;
  }
  function getSessionSeed() {
    return currentSeed();
  }
  function newSessionSeed() {
    memory.seed = createSeed();
    memory.cache = { seed: memory.seed, topics: {} };
    var store = storage('sessionStorage');
    try {
      if (store) {
        store.setItem(SEED_KEY, memory.seed);
        store.removeItem(QUESTIONS_KEY);
      }
    } catch (_) {}
    return memory.seed;
  }

  function normalizeStats(value) {
    var result = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
    Object.keys(value).forEach(function (id) {
      var row = value[id];
      if (!row || typeof row !== 'object') return;
      result[id] = {
        seen: Math.max(0, Number(row.seen) || 0),
        correct: Math.max(0, Number(row.correct) || 0),
        wrong: Math.max(0, Number(row.wrong) || 0),
        streak: Math.max(0, Number(row.streak) || 0),
        lastSeen: row.lastSeen || null,
        nextDue: row.nextDue || null
      };
    });
    return result;
  }
  function readStatsObject() {
    if (memory.stats) return memory.stats;
    var store = storage('localStorage');
    memory.stats = normalizeStats(readJson(store, STATS_KEY, {}));
    return memory.stats;
  }
  function saveStats(stats) {
    memory.stats = stats;
    writeJson(storage('localStorage'), STATS_KEY, stats);
  }
  function loadStats() {
    return clone(readStatsObject());
  }
  function ensureStat(stats, id) {
    if (!stats[id]) stats[id] = { seen: 0, correct: 0, wrong: 0, streak: 0, lastSeen: null, nextDue: null };
    return stats[id];
  }
  function seenQuestion(id, now) {
    var stats = readStatsObject();
    var row = ensureStat(stats, id);
    row.seen += 1;
    row.lastSeen = new Date(now).toISOString();
    saveStats(stats);
  }
  function recordAnswer(questionId, isCorrect) {
    var id = String(questionId == null ? '' : questionId);
    if (!id) return null;
    var now = Date.now();
    var stats = readStatsObject();
    var row = ensureStat(stats, id);
    if (isCorrect) {
      row.correct += 1;
      row.streak += 1;
      var intervals = [10 * MINUTE, DAY, 3 * DAY, 7 * DAY, 21 * DAY];
      row.nextDue = new Date(now + intervals[Math.min(row.streak, 5) - 1]).toISOString();
    } else {
      row.wrong += 1;
      row.streak = 0;
      row.nextDue = new Date(now + 5 * MINUTE).toISOString();
    }
    row.lastSeen = new Date(now).toISOString();
    saveStats(stats);
    return clone(row);
  }

  function idOfQuestion(question) {
    if (!question || typeof question !== 'object') return '';
    var id = question.question_id != null ? question.question_id :
      question.id != null ? question.id :
      question.sourceQuestionId != null ? question.sourceQuestionId : '';
    return String(id);
  }
  function topicIdOf(topic) {
    if (!topic || typeof topic !== 'object') return 'all';
    return String(topic.topic_id != null ? topic.topic_id :
      topic.id != null ? topic.id : topic.topic_name || 'all');
  }
  function questionsOf(topic, options) {
    if (Array.isArray(options && options.pool)) return options.pool;
    if (Array.isArray(topic)) return topic;
    return Array.isArray(topic && topic.practice_questions) ? topic.practice_questions : [];
  }
  function dueAt(row) {
    if (!row || !row.nextDue) return NaN;
    var value = typeof row.nextDue === 'number' ? row.nextDue : Date.parse(row.nextDue);
    return Number.isFinite(value) ? value : NaN;
  }
  function pickQuestions(topic, options) {
    options = options || {};
    var count = Math.max(0, Math.floor(Number(options.count) || 10));
    if (!count) return [];
    var pool = questionsOf(topic, options).filter(function (q) { return !!idOfQuestion(q); });
    var stats = readStatsObject();
    var now = Date.now();
    var baseSeed = getSessionSeed() + '|' + topicIdOf(topic);
    var mode = String(options.mode || 'balanced');
    var selected;

    if (mode === 'review' || mode === 'overdue') {
      var dueRows = pool.filter(function (q) {
        var due = dueAt(stats[idOfQuestion(q)]);
        return Number.isFinite(due) && due <= now;
      });
      selected = shuffle(dueRows, baseSeed + '|overdue').slice(0, count);
    } else if (mode === 'hardest') {
      var attempted = pool.filter(function (q) {
        var row = stats[idOfQuestion(q)];
        return row && row.seen > 0;
      });
      selected = shuffle(attempted, baseSeed + '|hardest-ties').sort(function (a, b) {
        var left = stats[idOfQuestion(a)] || {};
        var right = stats[idOfQuestion(b)] || {};
        var leftRate = (Number(left.wrong) || 0) / Math.max(1, Number(left.seen) || 0);
        var rightRate = (Number(right.wrong) || 0) / Math.max(1, Number(right.seen) || 0);
        return rightRate - leftRate || (Number(right.wrong) || 0) - (Number(left.wrong) || 0);
      }).slice(0, count);
    } else {
      var unseen = [], overdue = [], notDue = [];
      pool.forEach(function (q) {
        var row = stats[idOfQuestion(q)];
        if (!row || row.seen < 1) unseen.push(q);
        else {
          var due = dueAt(row);
          if (Number.isFinite(due) && due <= now) overdue.push(q);
          else notDue.push(q);
        }
      });
      selected = shuffle(unseen, baseSeed + '|unseen')
        .concat(shuffle(overdue, baseSeed + '|overdue'))
        .concat(shuffle(notDue, baseSeed + '|not-due'))
        .slice(0, count);
    }

    selected = shuffle(selected, baseSeed + '|final-order');
    if (options.markSeen !== false) {
      selected.forEach(function (q) { seenQuestion(idOfQuestion(q), now); });
    }
    return selected;
  }

  function pickTopics(topics) {
    var list = Array.isArray(topics) ? topics : [];
    return shuffle(list, getSessionSeed() + '|topics');
  }

  function readSessionCache() {
    if (memory.cache && memory.cache.seed === getSessionSeed()) return memory.cache;
    var value = readJson(storage('sessionStorage'), QUESTIONS_KEY, null);
    if (!value || value.seed !== getSessionSeed() || !value.topics || typeof value.topics !== 'object') {
      value = { seed: getSessionSeed(), topics: {} };
    }
    memory.cache = value;
    return value;
  }
  function writeSessionCache(cache) {
    memory.cache = cache;
    writeJson(storage('sessionStorage'), QUESTIONS_KEY, cache);
  }
  function getSessionQuestions(topicId, allTopics) {
    var wanted = String(topicId == null ? '' : topicId);
    var topics = Array.isArray(allTopics) ? allTopics : [];
    var topic = topics.find(function (row) { return topicIdOf(row) === wanted; });
    if (!topic) return [];
    var pool = questionsOf(topic);
    var lookup = new Map(pool.map(function (q) { return [idOfQuestion(q), q]; }));
    var cache = readSessionCache();
    var cachedIds = cache.topics[wanted];
    if (Array.isArray(cachedIds)) {
      var cached = cachedIds.map(function (id) { return lookup.get(String(id)); }).filter(Boolean);
      if (cached.length === cachedIds.length) return cached;
    }
    var selected = pickQuestions(topic, { count: 10 });
    cache.topics[wanted] = selected.map(idOfQuestion);
    writeSessionCache(cache);
    return selected;
  }

  function resetStats() {
    memory.stats = {};
    removeKey(storage('localStorage'), STATS_KEY);
    return {};
  }

  root.EngoRotation = {
    getSessionSeed: getSessionSeed,
    newSessionSeed: newSessionSeed,
    pickTopics: pickTopics,
    pickQuestions: pickQuestions,
    getSessionQuestions: getSessionQuestions,
    recordAnswer: recordAnswer,
    loadStats: loadStats,
    _resetStats: resetStats
  };
})(window);
