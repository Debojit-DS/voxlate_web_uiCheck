import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const apiUrl=moduleUrl(compile(await readFile(new URL('../lib/apiClient.ts',import.meta.url),'utf8')));
const careersSource=compile(await readFile(new URL('../lib/careersApi.ts',import.meta.url),'utf8')).replace('"./apiClient"',JSON.stringify(apiUrl));
const { uploadCareerResume, submitCareerApplication }=await import(moduleUrl(careersSource));
const answers={fullName:' Fixture Candidate ',email:' fixture@example.invalid ',phone:'0000000000',college:'Fixture College',year:'Other',role:'UI / UX Design',skills:'Fixture skills',motivation:'Fixture motivation',project:'',ideas:'Fixture idea',differentiator:'Fixture experience',links:''};
const resumeUrl='https://res.cloudinary.com/fixture/raw/upload/fixture.pdf';
const file=new File(['%PDF-1.4\nfixture'],'fixture.pdf',{type:'application/pdf'});

test('resume and application use the original same-origin endpoints and field names',async()=>{
  const original=globalThis.fetch;
  const calls=[];
  try {
    globalThis.fetch=async(path,options)=>{
      calls.push([path,options]);
      return Response.json({status:'success',data:path==='/api/upload/resume'?{url:resumeUrl}:{id:'fixture-application'}});
    };
    const url=await uploadCareerResume(file);
    assert.equal(await submitCareerApplication(answers,url),'fixture-application');
    assert.deepEqual(calls.map(([path])=>path),['/api/upload/resume','/api/careers/apply']);
    assert.equal(calls[0][1].body.get('resume').name,'fixture.pdf');
    assert.equal(calls[0][1].headers,undefined);
    for(const [,options] of calls){assert.equal(options.credentials,'include');assert.ok(options.signal);}
    assert.deepEqual(JSON.parse(calls[1][1].body),{fullName:'Fixture Candidate',email:'fixture@example.invalid',contactNumber:'0000000000',college:'Fixture College',currentYear:'Other',roleAppliedFor:'UI / UX Design',strongestSkills:'Fixture skills',motivation:'Fixture motivation',projectDetails:null,proposedIdea:'Fixture idea',uniqueEdge:'Fixture experience',portfolioLinks:null,resumeUrl});
  } finally {globalThis.fetch=original;}
});
test('invalid files, insecure upload URLs, and malformed success payloads are rejected',async()=>{
  await assert.rejects(uploadCareerResume(new File(['text'],'wrong.txt',{type:'text/plain'})),/PDF/);
  const original=globalThis.fetch;
  try {
    globalThis.fetch=async()=>Response.json({status:'success',data:{url:'http://insecure.example/fixture.pdf'}});
    await assert.rejects(uploadCareerResume(file),/couldn't be confirmed/);
    globalThis.fetch=async()=>Response.json({status:'success',data:{}});
    await assert.rejects(submitCareerApplication(answers,resumeUrl),/could not be confirmed/);
    globalThis.fetch=async()=>Response.json({status:'error',message:'Fixture storage unavailable'},{status:503});
    await assert.rejects(submitCareerApplication(answers,resumeUrl),/Fixture storage unavailable/);
  } finally {globalThis.fetch=original;}
});
