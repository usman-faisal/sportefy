
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const NotSelfUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const currentUser = request.user;
    const userId = request.params.userId;
    
    if (!currentUser || !currentUser.id) {
      throw new BadRequestException('User context not found');
    }
    
    if (userId === currentUser.id) {
      throw new BadRequestException('Cannot perform this action on yourself');
    }
    
    return userId;
  },
);