#!/usr/bin/env node
"use strict";const c=require("commander"),u=require("net"),l=require("@xiaou66/interconnect-client"),p="1.0.2",d="用于命令行上传图片到uTools图床Plus插件的工具",a={version:p,description:d},{ServiceClient:m}=l;async function g(t,r){const{uploadId:s,timeout:n=15e3}=r;try{const o=await new m(u,"picture-bed-plus","command",!1).callServiceMethod("service.upload.file.sync",{filePath:t,uploadWay:s},{timeout:n});return{url:(o==null?void 0:o.url)||"",success:!!(o!=null&&o.url)}}catch(e){return{url:"",success:!1,error:e instanceof Error?e.message:String(e)}}}async function f(t,r){const s=[];for(const n of t){const e=await g(n,r);s.push(e)}return s}c.program.version(a.version).description(a.description);c.program.arguments("<imagePaths...>").description("图片地址，可传多个").option("-u, --uploadId <uploadId>","图床源,需要和「utools」图床Plus 填写存储源id").option("-t, --timeout <timeout>","上传超时时间（毫秒），默认15000","15000").action(async(t,{uploadId:r,timeout:s},n)=>{try{const e=await f(t,{uploadId:r,timeout:parseInt(s,10)});let o=0;e.forEach((i,h)=>{i.success&&(console.log(i.url),o++)}),process.exit(o>0?0:1)}catch(e){console.error("上传过程出现错误:",e instanceof Error?e.message:String(e)),process.exit(1)}});c.program.parse();
