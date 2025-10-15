import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './Event';
import { Attendee } from './Attendee';
import { Booth } from './Booth';

@Entity('scan_records')
export class ScanRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'attendee_id', type: 'uuid' })
  attendeeId!: string;

  @Column({ name: 'booth_id', type: 'uuid' })
  boothId!: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string;

  @CreateDateColumn({ name: 'scanned_at' })
  scannedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => Attendee, attendee => attendee.scanRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendee_id' })
  attendee: Attendee;

  @ManyToOne(() => Booth, booth => booth.scanRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booth_id' })
  booth: Booth;

  @ManyToOne(() => Event, event => event.scanRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}