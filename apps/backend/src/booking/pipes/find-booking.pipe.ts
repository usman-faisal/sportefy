import { Injectable, PipeTransform, NotFoundException } from '@nestjs/common';
import { Booking } from '@sportefy/db-types';
import { BookingRepository } from '../booking.repository';

@Injectable()
export class FindBookingPipe
  implements PipeTransform<string, Promise<Booking>>
{
  constructor(private readonly bookingRepository: BookingRepository) {}

  /**
   * Transforms the booking ID into a Booking object.
   * @param bookingId The ID of the booking to find.
   * @returns The found booking object.
   * @throws NotFoundException if the booking is not found.
   */
  async transform(bookingId: string): Promise<Booking> {
    if (!bookingId) {
      throw new NotFoundException('Booking ID is required');
    }

    const booking = await this.bookingRepository.getBookingById(bookingId);

    if (!booking) {
      throw new NotFoundException('booking not found');
    }

    return booking;
  }
}
