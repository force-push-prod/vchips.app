export interface Table {
  tableId: string;
  ttl: number;
  players: Record<number, string>;
  nestedTablePayload: any;
}