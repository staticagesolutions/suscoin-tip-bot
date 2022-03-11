import { AdminStatus } from "./admin-status";

export interface Admin {
  name: string;
  address: string;
  status: AdminStatus;
}
