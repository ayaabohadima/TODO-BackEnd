export interface CreateDto {
  name: string;
  description?: string;
  toDoDate?: Date;
  ifDone?: boolean;
  endTime?: Number;
}