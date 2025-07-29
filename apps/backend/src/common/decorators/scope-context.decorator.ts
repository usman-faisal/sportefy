import { SetMetadata } from '@nestjs/common';
import { Scope } from '../types';

export const SCOPE_CONTEXT = 'scope_context';

export const ScopeContext = (scope: Scope, paramName: string) => 
    SetMetadata(SCOPE_CONTEXT, { scope, paramName });