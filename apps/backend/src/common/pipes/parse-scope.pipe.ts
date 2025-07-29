import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Scope } from '../types';

@Injectable()
export class ParseScopePipe implements PipeTransform<string, Scope> {
  transform(value: string): Scope {
    const lowerValue = value.toLowerCase();
    if (!Object.values(Scope).includes(lowerValue as Scope)) {
      throw new BadRequestException(`Invalid scope: "${value}". Must be one of [${Object.values(Scope).join(', ')}]`);
    }
    return lowerValue as Scope;
  }
}