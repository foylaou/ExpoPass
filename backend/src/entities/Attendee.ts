import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { Event } from './Event';
import { ScanRecord } from './ScanRecord';

@Entity('attendees')
@Unique(['eventId', 'email'])
export class Attendee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 200, nullable: true })
  company?: string;

  @Column({ length: 100, nullable: true })
  title?: string;

  @Column({ length: 50, nullable: true })
  phone?: string;

  @Column({ name: 'qr_code_token', length: 255, unique: true })
  qrCodeToken: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ name: 'badge_number', length: 50, nullable: true })
  badgeNumber?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Event, event => event.attendees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => ScanRecord, scanRecord => scanRecord.attendee)
  scanRecords: ScanRecord[];
}