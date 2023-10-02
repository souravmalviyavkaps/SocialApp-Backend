import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginateDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page: number;

  @IsOptional()
  @Type(() => Number)
  @Min(5)
  @IsPositive()
  limit: number;
}
