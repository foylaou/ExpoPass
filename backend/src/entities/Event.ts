import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Attendee } from './Attendee';
import { Booth } from './Booth';
import { ScanRecord } from './ScanRecord';

export enum EventStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  ENDED = 'ended'
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_name', type: 'varchar', length: 200 })
  eventName!: string;

  @Column({ name: 'event_code', type: 'varchar', length: 50, unique: true })
  eventCode!: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: Date;

  @Column({ type: 'varchar', length: 300, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING
  })
  status!: EventStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Attendee, attendee => attendee.event)
  attendees!: Attendee[];

  @OneToMany(() => Booth, booth => booth.event)
  booths!: Booth[];

  @OneToMany(() => ScanRecord, scanRecord => scanRecord.event)
  scanRecords!: ScanRecord[];
}