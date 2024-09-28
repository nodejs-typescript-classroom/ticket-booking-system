import { IsOptional, IsString } from 'class-validator';

export class ApiResponse<T> {
  @IsString()
  message: string;
  @IsOptional()
  @IsString()
  error?: string;
  data: T;
}