import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};
const ALLOWED_TABLES = new Set([
  'profiles',
  'swipes',
  'matches',
  'messages',
  'likes_revealed',
  'blocks',
  'reports',
  'user_purchases',
  'premium_features',
  'profile_boosts'
]);
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const adminTokenHeader = req.headers.get('x-admin-token') ?? '';
    const adminTokenSecret = Deno.env.get('ADMIN_OPS_TOKEN') ?? '';
    if (!adminTokenSecret || adminTokenHeader !== adminTokenSecret) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    if (!serviceRoleKey || !supabaseUrl) {
      return json({ error: 'Missing service configuration' }, 500);
    }
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const body = await safeJson(req);
    const action = body?.action as string | undefined;
    if (!action) {
      return json({ error: 'Missing action' }, 400);
    }
    switch (action) {
      case 'select': {
        const { table, filters = {}, limit = 100, order } = body ?? {};
        assertTable(table);
        let q = admin.from(table).select('*').limit(limit);
        for (const [k, v] of Object.entries(filters)) {
          // @ts-ignore - dynamic filter
          q = q.eq(k, v);
        }
        if (order?.column) {
          q = q.order(order.column, { ascending: !!order.ascending });
        }
        const { data, error } = await q;
        if (error) throw error;
        return json({ data });
      }
      case 'insert': {
        const { table, values } = body ?? {};
        assertTable(table);
        if (!values) return json({ error: 'Missing values' }, 400);
        const { data, error } = await admin.from(table).insert(values).select('*');
        if (error) throw error;
        return json({ data });
      }
      case 'update': {
        const { table, match, values } = body ?? {};
        assertTable(table);
        if (!values || !match) return json({ error: 'Missing match/values' }, 400);
        let q = admin.from(table).update(values);
        for (const [k, v] of Object.entries(match)) {
          // @ts-ignore - dynamic match
          q = q.eq(k, v);
        }
        const { data, error } = await q.select('*');
        if (error) throw error;
        return json({ data });
      }
      case 'delete': {
        const { table, match } = body ?? {};
        assertTable(table);
        if (!match) return json({ error: 'Missing match' }, 400);
        let q = admin.from(table).delete();
        for (const [k, v] of Object.entries(match)) {
          // @ts-ignore - dynamic match
          q = q.eq(k, v);
        }
        const { data, error } = await q.select('*');
        if (error) throw error;
        return json({ data });
      }
      case 'storage.createBucket': {
        const { name, public: isPublic = true } = body ?? {};
        if (!name) return json({ error: 'Missing bucket name' }, 400);
        // @ts-ignore - createBucket available with service role
        const { data, error } = await (admin.storage as any).createBucket(name, { public: isPublic });
        if (error) throw error;
        return json({ data });
      }
      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e: any) {
    return json({ error: e?.message ?? 'Internal error' }, 500);
  }
});
function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status
  });
}
async function safeJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}
function assertTable(table: unknown): asserts table is string {
  if (typeof table !== 'string' || !ALLOWED_TABLES.has(table)) {
    throw new Error('Table not allowed');
  }
}
