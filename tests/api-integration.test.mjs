import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import ts from 'typescript';
async function source(path) {
  const code = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}
const { proxyApiRequest, getApiBase } = await source('../lib/server/apiProxy.ts');
const { safeRedirect } = await source('../lib/safeRedirect.ts');
const { translateRecording, demoSocketUrl } = await source('../lib/demoTransport.ts');

async function upstream(fn, verify) {
  const server = createServer(fn); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await verify(`http://127.0.0.1:${server.address().port}`); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
const env = base => ({ NODE_ENV: 'production', API_BASE_URL: base, ALLOW_LOCAL_API_IN_PRODUCTION: '1' });
const request = (path, options) => new Request(`http://frontend.example/api/${path}`, options);

test('proxy forwards JSON/query/session/IP and preserves multiple cookies', async () => {
  await upstream(async (req, res) => {
    let body=''; for await (const chunk of req) body += chunk;
    assert.equal(req.url, '/api/auth/login?return=demo'); assert.equal(req.method, 'POST');
    assert.equal(req.headers.cookie,'voxlate_session=test'); assert.equal(req.headers['x-forwarded-for'],'203.0.113.5');
    assert.deepEqual(JSON.parse(body), { email: 'test@example.invalid' });
    res.writeHead(201, { 'Content-Type':'application/json', 'Set-Cookie':['voxlate_session=new; HttpOnly; Path=/','legacy=; Max-Age=0; Path=/'] });
    res.end('{"status":"success"}');
  }, async base => {
    const response = await proxyApiRequest(request('auth/login?return=demo', { method:'POST',headers:{'Content-Type':'application/json', Cookie:'voxlate_session=test', 'X-Forwarded-For':'203.0.113.5'}, body:JSON.stringify({email:'test@example.invalid'}) }),env(base));
    assert.equal(response.status,201);assert.equal(response.headers.getSetCookie().length,2);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal((await response.json()).status,'success');
  });
});
test('proxy preserves multipart resume body and backend validation JSON', async () => {
  await upstream(async (req,res) => {
    assert.match(req.headers['content-type'],/multipart\/form-data; boundary=/);
    let body=''; for await(const chunk of req) body += chunk;
    assert.match(body,/name="resume"/); assert.match(body,/%PDF-fixture/);
    res.writeHead(400,{'Content-Type':'application/json'});res.end('{"status":"error","code":"validation_error"}');
  },async base=>{
    const form=new FormData();form.append('resume',new Blob(['%PDF-fixture'],{type:'application/pdf'}),'fixture.pdf');
    const response=await proxyApiRequest(request('upload/resume',{method:'POST',body:form}),env(base));assert.equal(response.status,400);assert.equal((await response.json()).code,'validation_error');
  });
});
test('proxy turns HTML failures and a stalled body into bounded JSON errors',async()=>{
  await upstream((req,res)=>{res.writeHead(502,{'Content-Type':'text/html'});res.end('<html>private upstream error</html>');},async base=>{
    const response=await proxyApiRequest(request('reviews'),env(base));assert.equal(response.status,502);assert.equal((await response.json()).status,'error');
  });
  await upstream((req,res)=>{res.writeHead(200,{'Content-Type':'application/json'});res.write('{');},async base=>{
    const response=await proxyApiRequest(request('reviews'),{...env(base),API_TIMEOUT_MS:'100'});assert.equal(response.status,504);
  });
});
test('production rejects missing/loopback API and proxy recursion; upload limit enforced',async()=>{
  assert.throws(()=>getApiBase({NODE_ENV:'production'}));assert.throws(()=>getApiBase({NODE_ENV:'production',API_BASE_URL:'http://localhost:3001'}));
  assert.equal((await proxyApiRequest(request('reviews'),{NODE_ENV:'production',API_BASE_URL:'http://frontend.example'})).status,503);
  const response=await proxyApiRequest(request('upload',{method:'POST',body:'x',headers:{'Content-Length':String(17*1024*1024)}}),env('http://127.0.0.1:1'));assert.equal(response.status,413);
});
test('redirects stay inside the website',()=>{
  for(const value of ['https://evil.example','//evil.example','/\\evil.example','javascript:alert(1)',null])assert.equal(safeRedirect(value),'/');
  assert.equal(safeRedirect('/demo?autoOpen=waitlist'),'/demo?autoOpen=waitlist');
});
class Socket {
  sent=[];closed=false;send(value){this.sent.push(value);}close(){this.closed=true;}
  open(){this.onopen?.();}message(value){this.onmessage?.({data:value});}
}
const clip=new Blob(['fixture']);
function transport(socket, overrides={}) { return translateRecording({url:'wss://speech.example/ws',token:'signed-ticket',audio:clip,language:'hi',signal:new AbortController().signal,socketFactory:()=>socket,...overrides}); }
test('demo sends signed ticket and one clip, validates result, and closes socket',async()=>{
  const socket=new Socket();const pending=transport(socket);socket.open();assert.deepEqual(socket.sent,['auth: signed-ticket']);
  socket.message('permitted');socket.message('permitted');await new Promise(resolve=>setImmediate(resolve));
  assert.equal(socket.sent.length,3);assert.equal(socket.sent[2],'lang: hi');
  socket.message(JSON.stringify({status:'success',original_text:'Hello',translated_text:'नमस्ते',audio_base64:btoa('RIFFfixture')}));
  assert.equal((await pending).translated_text,'नमस्ते');assert.ok(socket.closed);assert.equal(socket.onmessage,null);
});
test('demo quota, malformed result, timeout, and cancellation all close connections',async()=>{
  for(const response of ['denied','unauthorized','{"status":"success"}']) { const socket=new Socket();const pending=transport(socket);socket.message(response);await assert.rejects(pending);assert.ok(socket.closed); }
  const stalled=new Socket();await assert.rejects(transport(stalled,{connectTimeoutMs:10}),/too long/);assert.ok(stalled.closed);
  const aborted=new Socket();const controller=new AbortController();const pending=transport(aborted,{signal:controller.signal});controller.abort();await assert.rejects(pending,/cancelled/);assert.ok(aborted.closed);
});
test('production speech URL must be configured, remote, and secure for HTTPS',()=>{
  assert.throws(()=>demoSocketUrl(undefined,'https:',true));assert.throws(()=>demoSocketUrl('ws://speech.example/ws','https:',true));assert.throws(()=>demoSocketUrl('wss://localhost/ws','https:',true));
  assert.equal(demoSocketUrl('wss://speech.example/ws','https:',true),'wss://speech.example/ws');
});
