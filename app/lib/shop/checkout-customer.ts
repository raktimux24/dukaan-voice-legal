import type {CreateSalePayload} from './types';
type Selection={customerId:string|null;customerName:string|null;customerPhone:string|null};
/** A selected customer's display snapshot is part of the original immutable request.
 * The server resolves customerId first; this snapshot does not create or edit that customer.
 * Legacy pending requests retain their original null customer field during retries.
 */
export function checkoutCustomer(selection:Selection,clientId:string|null,retained?:Pick<CreateSalePayload,'customerId'|'customer'>):CreateSalePayload['customer']{
 if(selection.customerId&&retained?.customerId===selection.customerId&&retained.customer==null)return null;
 const name=selection.customerName?.trim();if(!name)return null;
 const customer={name,phone:selection.customerPhone??null};
 return selection.customerId?customer:{...customer,clientId:clientId??crypto.randomUUID()};
}
