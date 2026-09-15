const URL='https://kdfbxcdxdhofqidczbot.supabase.co';
const KEY='sb_publishable_51lY0ST_vE6v0nogH5RGkQ_z8lJ5EAM';
// Atomic database quota; never fall back to an instance-local counter.
export async function allowUsage(req,res,action,units=1){
  try{
    const r=await fetch(`${URL}/rest/v1/rpc/consume_api_quota`,{
      method:'POST',headers:{apikey:KEY,Authorization:req.headers.authorization,'Content-Type':'application/json'},
      body:JSON.stringify({p_action:action,p_units:units}),signal:AbortSignal.timeout(8000)
    });
    if(!r.ok)throw new Error('Quota service unavailable');
    const result=await r.json();
    if(result.allowed===true)return true;
    res.setHeader('Retry-After',String(result.retry_after||60));
    res.status(429).json({error:'وصلت لحد الاستخدام المؤقت. جرّب بعد شوية.',retryAfter:result.retry_after||60});
  }catch{
    res.status(503).json({error:'تعذّر التحقق من حد الاستخدام. جرّب تاني بعد قليل.'});
  }
  return false;
}
