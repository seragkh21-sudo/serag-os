import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';

const SUPABASE_URL = 'https://kdfbxcdxdhofqidczbot.supabase.co';
const SUPABASE_KEY = 'sb_publishable_51lY0ST_vE6v0nogH5RGkQ_z8lJ5EAM';

function bearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}

async function verifyUser(token) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  return r.json();
}

function dbClient(token) {
  async function request(table, { method = 'GET', query = '', body } = {}) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`, {
      method,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await r.text();
    const data = text ? JSON.parse(text) : null;
    if (!r.ok) throw new Error(data?.message || data?.error || `Database error ${r.status}`);
    return data;
  }
  return {
    get: (table, query) => request(table, { query }),
    insert: (table, body) => request(table, { method: 'POST', body }),
    update: (table, id, body) => request(table, { method: 'PATCH', query: `id=eq.${encodeURIComponent(id)}`, body }),
  };
}

async function loadContext(db) {
  const [profile, tasks, meals, water, courses, projects, resources, words, grammar, workouts, history] = await Promise.all([
    db.get('profiles', 'select=display_name,calorie_target,protein_target,water_target&limit=1'),
    db.get('tasks', 'select=id,title,category,due_at,priority,status,notes&status=neq.done&order=due_at.asc.nullslast&limit=30'),
    db.get('meals', 'select=name,calories,protein_g,carbs_g,fat_g,eaten_at,notes&order=eaten_at.desc&limit=20'),
    db.get('water_logs', 'select=amount_ml,logged_at&order=logged_at.desc&limit=30'),
    db.get('courses', 'select=id,title,category,url,progress,status,notes&order=updated_at.desc&limit=25'),
    db.get('creative_projects', 'select=id,title,project_type,brief,status,deadline&order=updated_at.desc&limit=20'),
    db.get('creative_resources', 'select=title,url,resource_type,tags,notes&order=created_at.desc&limit=25'),
    db.get('english_words', 'select=word,meaning,example,status&order=created_at.desc&limit=30'),
    db.get('grammar_topics', 'select=title,notes,status&order=created_at.desc&limit=20'),
    db.get('workouts', 'select=title,workout_date,notes&order=workout_date.desc&limit=12'),
    db.get('assistant_messages', 'select=role,content,created_at&order=created_at.desc&limit=16'),
  ]);
  return { profile: profile?.[0] || {}, tasks, meals, water, courses, projects, resources, words, grammar, workouts, history: (history || []).reverse() };
}

function makeTools(db, userId) {
  return {
    addTask: tool({
      description: 'Add a task to Serag OS when the user asks to remember, schedule, add, or track something.',
      inputSchema: z.object({
        title: z.string().min(1),
        category: z.enum(['general', 'work', 'english', 'fitness', 'creative']).default('general'),
        due_at: z.string().nullable().optional().describe('ISO 8601 date-time with timezone when known'),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
        notes: z.string().nullable().optional(),
      }),
      execute: async (x) => {
        const rows = await db.insert('tasks', { user_id: userId, title: x.title, category: x.category, due_at: x.due_at || null, priority: x.priority, notes: x.notes || null });
        return { ok: true, action: 'task_added', item: rows?.[0] };
      },
    }),
    markTaskDone: tool({
      description: 'Mark an existing task as done. Use only an id present in the supplied current task context.',
      inputSchema: z.object({ task_id: z.string().uuid() }),
      execute: async ({ task_id }) => {
        const rows = await db.update('tasks', task_id, { status: 'done' });
        return { ok: true, action: 'task_done', item: rows?.[0] };
      },
    }),
    logWater: tool({
      description: 'Log water the user says they drank. One cup is 250 ml unless the user gives a specific ml amount.',
      inputSchema: z.object({ amount_ml: z.number().int().min(50).max(5000) }),
      execute: async ({ amount_ml }) => {
        const rows = await db.insert('water_logs', { user_id: userId, amount_ml });
        return { ok: true, action: 'water_logged', amount_ml, item: rows?.[0] };
      },
    }),
    addMeal: tool({
      description: 'Save a meal. Calories/macros may be reasonable estimates when the user has not supplied exact values; the assistant must say they are estimates.',
      inputSchema: z.object({
        name: z.string().min(1),
        calories: z.number().int().min(0).max(10000).nullable().optional(),
        protein_g: z.number().min(0).max(1000).nullable().optional(),
        carbs_g: z.number().min(0).max(2000).nullable().optional(),
        fat_g: z.number().min(0).max(1000).nullable().optional(),
        notes: z.string().nullable().optional(),
      }),
      execute: async (x) => {
        const rows = await db.insert('meals', { user_id: userId, name: x.name, calories: x.calories ?? null, protein_g: x.protein_g ?? 0, carbs_g: x.carbs_g ?? 0, fat_g: x.fat_g ?? 0, notes: x.notes || null });
        return { ok: true, action: 'meal_added', item: rows?.[0] };
      },
    }),
    addWorkout: tool({
      description: 'Save a workout session or gym log.',
      inputSchema: z.object({ title: z.string().min(1), notes: z.string().nullable().optional(), workout_date: z.string().nullable().optional() }),
      execute: async (x) => {
        const rows = await db.insert('workouts', { user_id: userId, title: x.title, notes: x.notes || null, workout_date: x.workout_date || new Date().toISOString().slice(0, 10), exercises: [] });
        return { ok: true, action: 'workout_added', item: rows?.[0] };
      },
    }),
    addEnglishWord: tool({
      description: 'Save a new English vocabulary word.',
      inputSchema: z.object({ word: z.string().min(1), meaning: z.string().nullable().optional(), example: z.string().nullable().optional() }),
      execute: async (x) => {
        const rows = await db.insert('english_words', { user_id: userId, word: x.word, meaning: x.meaning || null, example: x.example || null });
        return { ok: true, action: 'word_added', item: rows?.[0] };
      },
    }),
    addGrammarTopic: tool({
      description: 'Save an English grammar topic or notes for later review.',
      inputSchema: z.object({ title: z.string().min(1), notes: z.string().nullable().optional() }),
      execute: async (x) => {
        const rows = await db.insert('grammar_topics', { user_id: userId, title: x.title, notes: x.notes || null });
        return { ok: true, action: 'grammar_added', item: rows?.[0] };
      },
    }),
    saveWriting: tool({
      description: 'Save English writing practice or a draft in the English section.',
      inputSchema: z.object({ title: z.string().nullable().optional(), content: z.string().min(1) }),
      execute: async (x) => {
        const rows = await db.insert('english_writing', { user_id: userId, title: x.title || null, content: x.content });
        return { ok: true, action: 'writing_saved', item: rows?.[0] };
      },
    }),
    addCourse: tool({
      description: 'Add a course to either the English or Creative course list.',
      inputSchema: z.object({ title: z.string().min(1), category: z.enum(['english', 'creative']), url: z.string().nullable().optional(), progress: z.number().int().min(0).max(100).default(0), notes: z.string().nullable().optional() }),
      execute: async (x) => {
        const rows = await db.insert('courses', { user_id: userId, title: x.title, category: x.category, url: x.url || null, progress: x.progress, status: x.progress > 0 ? 'active' : 'saved', notes: x.notes || null });
        return { ok: true, action: 'course_added', item: rows?.[0] };
      },
    }),
    updateCourseProgress: tool({
      description: 'Update progress for an existing course. Use only a course id from the supplied context.',
      inputSchema: z.object({ course_id: z.string().uuid(), progress: z.number().int().min(0).max(100) }),
      execute: async (x) => {
        const rows = await db.update('courses', x.course_id, { progress: x.progress, status: x.progress >= 100 ? 'completed' : 'active', updated_at: new Date().toISOString() });
        return { ok: true, action: 'course_progress_updated', item: rows?.[0] };
      },
    }),
    addCreativeProject: tool({
      description: 'Add a graphic, motion, writing, editing, or other creative project.',
      inputSchema: z.object({ title: z.string().min(1), project_type: z.string().nullable().optional(), brief: z.string().nullable().optional(), deadline: z.string().nullable().optional() }),
      execute: async (x) => {
        const rows = await db.insert('creative_projects', { user_id: userId, title: x.title, project_type: x.project_type || null, brief: x.brief || null, deadline: x.deadline || null });
        return { ok: true, action: 'project_added', item: rows?.[0] };
      },
    }),
    addCreativeResource: tool({
      description: 'Save a website, reference, inspiration source, material source, font source, or other creative resource.',
      inputSchema: z.object({ title: z.string().min(1), url: z.string().nullable().optional(), resource_type: z.string().default('reference'), notes: z.string().nullable().optional() }),
      execute: async (x) => {
        const rows = await db.insert('creative_resources', { user_id: userId, title: x.title, url: x.url || null, resource_type: x.resource_type, notes: x.notes || null });
        return { ok: true, action: 'resource_added', item: rows?.[0] };
      },
    }),
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: 'Please sign in first.' });

  const user = await verifyUser(token);
  if (!user) return res.status(401).json({ error: 'Session expired. Sign in again.' });
  const db = dbClient(token);

  if (req.method === 'GET') {
    try {
      const rows = await db.get('assistant_messages', 'select=role,content,created_at&order=created_at.asc&limit=60');
      return res.status(200).json({ messages: rows || [] });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const prompt = String(req.body?.message || '').trim().slice(0, 6000);
    const timezone = String(req.body?.timezone || 'Africa/Cairo').slice(0, 80);
    if (!prompt) return res.status(400).json({ error: 'Message is empty.' });

    const context = await loadContext(db);
    const oldHistory = context.history.slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
    await db.insert('assistant_messages', { user_id: user.id, role: 'user', content: prompt });

    const system = `You are the smart assistant inside Serag OS. Default to concise Egyptian Arabic unless the user uses another language. You can answer questions and take actions in the app using tools. Never claim an action succeeded unless a tool result says ok:true. When the user asks to add/save/log/mark something, use the appropriate tool instead of only describing it. If food calories or macros are estimated, clearly label them as estimates. Interpret relative dates using timezone ${timezone}. Current server time: ${new Date().toISOString()}.

The following is the user's current Serag OS data. Treat it as private context and use only what is relevant. Do not invent missing facts.
${JSON.stringify({ profile: context.profile, tasks: context.tasks, meals: context.meals, water: context.water, courses: context.courses, projects: context.projects, resources: context.resources, words: context.words, grammar: context.grammar, workouts: context.workouts })}`;

    const result = await generateText({
      model: 'openai/gpt-5.6-terra-fast',
      system,
      messages: [...oldHistory, { role: 'user', content: prompt }],
      tools: makeTools(db, user.id),
      stopWhen: stepCountIs(6),
      maxOutputTokens: 1400,
    });

    const answer = result.text?.trim() || 'تم تنفيذ المطلوب.';
    const actions = result.steps.flatMap(step => step.toolResults || []).map(r => ({ tool: r.toolName, output: r.output }));
    await db.insert('assistant_messages', { user_id: user.id, role: 'assistant', content: answer, metadata: { actions } });
    return res.status(200).json({ answer, actions });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'Assistant error' });
  }
}
