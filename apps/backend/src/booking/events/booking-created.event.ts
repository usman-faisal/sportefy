export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly matchId: string,
    public readonly venueId: string,
    public readonly createdAt: Date,
  ) {}
}

