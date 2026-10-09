import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
process.env.NEXT_PUBLIC_API_BASE_URL='https://api.example.test';
const {bindApi,ApiError}=require(process.env.GST_TEST_BUILD+'/api.js');
const api=bindApi(async()=> 'test-token');
const original=globalThis.fetch;
try {
  let requests=[];
  globalThis.fetch=async(url,options)=>{requests.push({url,options});return Response.json({sales:[],refunds:[],total:0,hasMore:false,summary:{count:0,amount:0,byMethod:{}}});};
  await api.getSales('shop-a',{status:'voided',offset:50,limit:50,period:'month'});
  let query=new URL(requests[0].url);
  assert.equal(query.searchParams.get('offset'),'50');
  assert.equal(query.searchParams.get('status'),'voided');
  assert.equal(query.searchParams.get('period'),'month');
  await api.getReturns('shop-a',{period:'7d',offset:100,limit:50});
  query=new URL(requests[1].url);assert.equal(query.pathname,'/api/shops/shop-a/sales/refunds');assert.equal(query.searchParams.get('offset'),'100');
  const body={managerId:'manager',authorized:true,requestId:'stable-request',expectedMemberId:'membership',expectedEventId:'previous-event'};
  await api.setProductTaxAuthorization('shop-a',body);
  assert.equal(requests[2].options.method,'PUT');assert.deepEqual(JSON.parse(requests[2].options.body),body);
  assert.equal(requests[2].options.headers.Authorization,'Bearer test-token');
  globalThis.fetch=async()=>Response.json({error:'tax_authorization_conflict'},{status:409});
  await assert.rejects(api.setProductTaxAuthorization('shop-a',body),error=>error instanceof ApiError&&error.status===409&&error.code==='tax_authorization_conflict');
  globalThis.fetch=async()=>Response.json({error:'Insufficient permissions'},{status:403});
  await assert.rejects(api.setProductTaxAuthorization('shop-a',body),error=>error.status===403);
  console.log('Parity API: filtered pagination, refunds path, guarded authorization, conflict and role denial passed.');
} finally {globalThis.fetch=original;}
