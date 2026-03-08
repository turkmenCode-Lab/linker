import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class PatchAgeDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Age cannot be negative' })
  @Max(120, { message: 'Age cannot be greater than 120' })
  age: number;
}
