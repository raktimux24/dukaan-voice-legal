import type {GstContext, TaxTotals} from './gst-core/gst';

/** Match the backend before a number or immutable request is reserved. */
export function ordinaryDocumentType(context:GstContext, totals:TaxTotals) {
 const type=context.settings.registration==='composition'||totals.lines.every(line=>line.category!=='taxable')
  ?'bill_of_supply':totals.lines.some(line=>line.category!=='taxable')?'invoice_cum_bill_of_supply':'tax_invoice';
 if(type==='invoice_cum_bill_of_supply'&&context.buyer?.gstin)throw Error('mixed_b2b_document_not_supported');
 return type;
}
