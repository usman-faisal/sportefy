import { Controller, Get } from '@nestjs/common';
import { SportService } from './sport.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags("Sports")
@Controller('sports')
export class SportController {
    constructor(private readonly sportService: SportService) {}


    @Public()
    @Get()
    @ApiOperation({description: "get sports"})
    async getSports() {
        return this.sportService.getSports()
    }
}
