import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL || 'http://localhost:3002';
const checks=[
  ['auth/me','GET',undefined,401],['demo/token','POST',undefined,401],
  ['auth/login','POST',{},400],['auth/signup','POST',{},400],
  ['waitlist','POST',{},400],['reviews','POST',null,400],['careers/apply','POST',{},400],
  ['waitlist/sync-photo','POST',{},401],['upload','POST',{},400],
];
for(const [path,method,body,status] of checks){
  const response=await fetch(`${base}/api/${path}`,{method,headers:body!==undefined?{'Content-Type':'application/json'}:undefined,body:body!==undefined?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});
  const json=await response.json();assert.equal(response.status,status,path);assert.equal(json.status,'error',path);console.log(`${method} /api/${path}: ${status} JSON`);
}
const multipart=await fetch(`${base}/api/upload/resume`,{method:'POST',body:new FormData(),signal:AbortSignal.timeout(10000)});assert.equal(multipart.status,400);assert.equal((await multipart.json()).status,'error');console.log('POST /api/upload/resume: 400 JSON');
const logout=await fetch(`${base}/api/auth/logout`,{method:'POST',signal:AbortSignal.timeout(10000)});assert.equal(logout.status,200);assert.match(logout.headers.get('set-cookie'),/Max-Age=0/i);console.log('POST /api/auth/logout: 200 expired session cookie');
