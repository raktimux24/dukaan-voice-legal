/** Versioned, platform-independent inventory import wire contract. */
export const IMPORT_VERSION = 1;
export const IMPORT_FIELDS = ['name','barcode','shortCode','category','subcategory','unit','sellingPrice','mrp','purchasePrice','minStockLevel','initialStock','batchNumber','expiryDate','supplier','packSize','packLabel'] as const;
export type ImportField = typeof IMPORT_FIELDS[number];
export type ImportMapping = Partial<Record<ImportField, number>>;
export type ImportIssue = {code:string;field?:ImportField};
export type ImportSheet = {name:string;headers:string[];rows:{row:number;cells:string[];invalidColumns:number[];numericColumns?:number[]}[]};
export type ImportOptions = {sheet:number;mapping:ImportMapping;category:string;subcategory:string;asOf:string;mode:'create'|'update';skipRows:number[]};
export type ImportProduct = {name:string;barcode?:string;shortCode?:string;category:string;subcategory:string;unit:string;sellingPrice?:string;mrp?:string;purchasePrice?:string;minStockLevel:number;initialStock:number;batchNumber?:string;expiryDate?:string;supplier?:string;packSize?:string;packLabel?:string};
export type ImportReviewRow = {row:number;name:string;action:'create'|'update'|'skip';issues:ImportIssue[];warnings:ImportIssue[];product?:ImportProduct;targetId?:string;targetHash?:string;changes?:Partial<ImportProduct>;before?:Partial<ImportProduct>;outcome?:{productId:string;action:'create'|'update'}};
export type ImportJob = {openingSessionId?:string;id:string;filename:string;createdAt:string;version:number;state:'uploaded'|'review'|'applying'|'applied';sheets:ImportSheet[];options?:ImportOptions;rows:ImportReviewRow[];completedRequests:string[];sourceHash:string;total:number;applied:number};
export type ImportMetadata = {available:boolean;version:number;categories:{code:string;label:string;children:{code:string;label:string}[]}[];jobs:Pick<ImportJob,'id'|'filename'|'state'|'createdAt'|'total'|'applied'|'openingSessionId'>[]};
export type ImportTemplate = {filename:string;base64:string;mime:string};
export function importCounts(rows:ImportReviewRow[]){return {create:rows.filter(r=>r.action==='create'&&!r.issues.length).length,update:rows.filter(r=>r.action==='update'&&!r.issues.length).length,skip:rows.filter(r=>r.action==='skip').length,errors:rows.filter(r=>r.action!=='skip'&&r.issues.length>0).length};}
export function inferImportMapping(headers:string[]):ImportMapping{
 const aliases:Record<string,ImportField>={product:'name',productname:'name',item:'name',itemname:'name',price:'sellingPrice',saleprice:'sellingPrice',sellingprice:'sellingPrice',cost:'purchasePrice',costprice:'purchasePrice',purchaseprice:'purchasePrice',reorderlevel:'minStockLevel',minimumstock:'minStockLevel',openingstock:'initialStock',quantity:'initialStock',stock:'initialStock',batch:'batchNumber',expiry:'expiryDate',sku:'shortCode'};
 const result:ImportMapping={};headers.forEach((header,index)=>{const key=header.replace(/[\s_-]/g,'').toLowerCase();const field=IMPORT_FIELDS.find(f=>f.toLowerCase()===key)??aliases[key];if(field&&result[field]===undefined)result[field]=index;});return result;
}
