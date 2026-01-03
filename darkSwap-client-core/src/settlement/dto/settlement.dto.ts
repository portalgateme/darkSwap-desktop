import { BaseDto } from "../../types";

export class SettlementDto extends BaseDto {
    orderId: string;
    txHashSettled: string;
  } 