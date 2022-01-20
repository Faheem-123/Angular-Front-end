import { ORMLabOrder } from "./ORMLabOrder";
import { ORMLabOrderTest } from "./ORMLabOrderTest";
import { ORMLabOrderIcd } from "./ORMLabOrderIcd";
import { ORMLabOrderComment } from "./ORMLabOrderComment";
import { ORMKeyValue } from "../general/orm-key-value";


export class OrderSaveObjectWrapper {

order_id: Number;
practice_id: Number;
client_date: String;
system_ip: String;
loged_in_user: String;

order:ORMLabOrder;
lst_order_test:Array<ORMLabOrderTest>;
lst_order_diag:Array<ORMLabOrderIcd>;
order_comment:ORMLabOrderComment;
lst_deleted_ids: Array<ORMKeyValue>;

}