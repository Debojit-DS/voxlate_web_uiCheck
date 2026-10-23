import { test } from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../lib/db";
import { POST as uploadResume } from "../app/api/upload/resume/route";
import { POST as apply } from "../app/api/careers/apply/route";

const resumeUrl = "https://res.cloudinary.com/fixture/raw/upload/voxlate/resumes/fixture.pdf";
const fixture = { fullName:"Fixture Candidate",email:"Fixture@Example.invalid",contactNumber:"0000000000",college:"Fixture College",currentYear:"Other",roleAppliedFor:"UI / UX Design",strongestSkills:"Fixture skills",motivation:"Fixture motivation",projectDetails:null,proposedIdea:"Fixture idea",uniqueEdge:"Fixture experience",portfolioLinks:null,resumeUrl };

function resumeRequest(content = "%PDF-1.4\nfixture") {
  const body = new FormData();
  body.append("resume",new File([content],"fixture.pdf",{type:"application/pdf"}));
  return new NextRequest("http://api.example/api/upload/resume",{method:"POST",body});
}
function applyRequest(body: unknown = fixture) {
  return new NextRequest("http://api.example/api/careers/apply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
}

test("original resume upload contract returns a secure PDF URL", async () => {
  Object.assign(process.env,{CLOUDINARY_CLOUD_NAME:"fixture",CLOUDINARY_API_KEY:"fixture",CLOUDINARY_API_SECRET:"fixture"});
  const original=cloudinary.uploader.upload_stream;
  let uploaded=Buffer.alloc(0);
  try {
    cloudinary.uploader.upload_stream=((options: Record<string, unknown>, callback: (error: unknown, result: unknown) => void) => {
      assert.equal(options.folder,"voxlate/resumes");assert.equal(options.resource_type,"raw");
      return new Writable({write(chunk,encoding,done){uploaded=Buffer.concat([uploaded,chunk]);done();},final(done){callback(null,{secure_url:resumeUrl});done();}});
    }) as unknown as typeof original;
    const response=await uploadResume(resumeRequest());
    assert.equal(response.status,200);assert.equal((await response.json()).data.url,resumeUrl);assert.match(uploaded.toString(),/^%PDF-/);
  } finally { cloudinary.uploader.upload_stream=original; }
});
test("PDF MIME without PDF contents and empty files are rejected before provider calls",async()=>{
  for(const content of ["not a pdf",""]) {
    const response=await uploadResume(resumeRequest(content));assert.equal(response.status,400);assert.equal((await response.json()).code,"validation_error");
  }
});
test("candidate fields retain the original backend mapping and null optional answers",async()=>{
  const original=prisma.jobApplication.create;
  let stored: unknown;
  try {
    prisma.jobApplication.create=(async ({data}: {data:unknown}) => {stored=data;return {id:"fixture-application"};}) as unknown as typeof original;
    const response=await apply(applyRequest());assert.equal(response.status,200);
    assert.equal((await response.json()).data.id,"fixture-application");
    assert.deepEqual(stored,{...fixture,email:"fixture@example.invalid"});
  } finally { prisma.jobApplication.create=original; }
});
test("unavailable application storage produces an explicit failure, never success",async()=>{
  const original=prisma.jobApplication.create;
  try {
    prisma.jobApplication.create=(async () => {throw new Error("fixture outage");}) as unknown as typeof original;
    const response=await apply(applyRequest());assert.equal(response.status,503);assert.equal((await response.json()).status,"error");
  } finally { prisma.jobApplication.create=original; }
});
