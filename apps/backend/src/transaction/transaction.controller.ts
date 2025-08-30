import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Profile } from '@sportefy/db-types';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole } from 'src/common/types';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Auth(UserRole.USER)
    @Get('history')
    @ApiOperation({ summary: "Get the current user's transaction history" })
    getMyTransactionHistory(@CurrentUser() user: Profile) {
        return this.transactionService.getMyTransactionHistory(user);
    }
}
