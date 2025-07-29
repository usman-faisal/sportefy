import { Controller, Get, Param, Query } from '@nestjs/common';
import { SlotService } from './slot.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { GetVenueSlotsQuery } from './dto/get-venue-slots.dto';

@Controller('slot')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Public()
  @Get('venues/:venueId/slots')
  @ApiOperation({ summary: "Get a venue's available slots for a specific day" })
  @ApiParam({
    name: 'venueId',
    type: String,
    description: 'The ID of the venue to retrieve slots for',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of slots for the given day.',
  })
  @ApiResponse({ status: 404, description: 'Venue not found.' })
  async getVenueSlots(
    @Param('venueId') venue: string,
    @Query() query: GetVenueSlotsQuery,
  ) {
    return this.slotService.getVenueSlotsByDateOrRange(venue, query);
  }
}
