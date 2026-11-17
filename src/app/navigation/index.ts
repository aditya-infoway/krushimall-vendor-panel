import { dashboards } from "./segments/dashboards";
import { order } from "./segments/order";
// import { vendor} from "./segments/vendor"
//  import { master } from "./segments/master";
  import { productmaster } from "./segments/productmaster";
  import { coupan } from "./segments/coupon"
    import { logout } from "./segments/logout";
export const navigation = [
  dashboards,
//  vendor,
//    master,
  productmaster,
  order,
  coupan,
  logout
];
