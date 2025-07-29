import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/common/types';
import { Profile } from '@sportefy/db-types';
import { TransferCreditsDto } from './dto/transfer-credits.dto';
import { CreditService } from './credit.service';

@ApiTags('Credits')
@Controller('credits')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Auth(UserRole.ADMIN, UserRole.ADMIN)
  @Post('transfer')
  @ApiOperation({ description: 'Transfer credits to a user' })
  @ApiBody({ type: TransferCreditsDto })
  async transferCredits(
    @CurrentUser() user: Profile,
    @Body() body: TransferCreditsDto,
  ) {
    return this.creditService.transferCredits(user, body);
  }
}
