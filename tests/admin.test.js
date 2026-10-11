import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/admin-users.js';
const response = () => ({headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(body){this.body=body;return this}});
test('admin authorization fails closed and filters sensitive upstream data', async () => {
  const original = global.fetch;
  const saved = {...process.env};
  try {
    process.env.ADMIN_OWNER_IDS='owner'; process.env.SUPABASE_SERVICE_ROLE_KEY='server-secret';
    for (const mode of ['missing','invalid','outsider','anonymous','empty','unconfigured','page','upstream','timeout','allowed']) {
      const calls=[];
      process.env.ADMIN_OWNER_IDS=mode==='empty'?'':'owner';
      process.env.SUPABASE_SERVICE_ROLE_KEY=mode==='unconfigured'?'':'server-secret';
      global.fetch=async (url, options) => {
        calls.push(url);
        if (mode==='timeout') throw Error('private upstream details');
        if (url.endsWith('/user')) {
          assert.equal(options.headers.apikey.includes('server-secret'),false);
          return {ok:mode!=='invalid',json:async()=>({id:mode==='outsider'?'other':'owner',is_anonymous:mode==='anonymous',user_metadata:{role:'owner'}})};
        }
        assert.equal(options.headers.Authorization,'Bearer server-secret');
        return {ok:mode!=='upstream',json:async()=>({total:51,last_page:2,users:[{id:'id',email:'user@example.test',created_at:'2026-10-12',email_confirmed_at:null,last_sign_in_at:null,user_metadata:{secret:'private'},app_metadata:{role:'admin'},phone:'private'}]})};
      };
      const res=response();
      await handler({method:'GET',headers:mode==='missing'?{}:{authorization:'Bearer session'},query:{page:mode==='page'?'0':'1'}},res);
      assert.equal(res.code,({missing:401,invalid:401,outsider:403,anonymous:403,empty:403,unconfigured:503,page:400,upstream:502,timeout:502,allowed:200})[mode],mode);
      assert.equal(res.headers['Cache-Control'],'private, no-store');
      assert.equal(calls.some(url=>url.includes('/admin/')),['upstream','allowed'].includes(mode),mode);
      assert.equal(JSON.stringify(res.body).includes('server-secret'),false);
      assert.equal(JSON.stringify(res.body).includes('private'),false);
      if(mode==='allowed') { assert.deepEqual(Object.keys(res.body.users[0]),['id','email','created_at','email_confirmed_at','last_sign_in_at']); assert.equal(res.body.has_next,true); }
    }
    const res=response(); await handler({method:'POST',headers:{}},res); assert.equal(res.code,405); assert.equal(res.headers.Allow,'GET');
  } finally {
    global.fetch=original;
    for(const key of ['ADMIN_OWNER_IDS','SUPABASE_SERVICE_ROLE_KEY']) { if(saved[key]===undefined) delete process.env[key]; else process.env[key]=saved[key]; }
  }
});
