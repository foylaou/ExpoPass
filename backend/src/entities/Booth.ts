import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { Event } from './Event';
import { ScanRecord } from './ScanRecord';

@Entity('booths')
@Unique(['eventId', 'boothNumber'])
export class Booth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'booth_number', length: 50 })
  boothNumber: string;

  @Column({ name: 'booth_name', length: 200 })
  boothName: string;

  @Column({ length: 200, nullable: true })
  company?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 200, nullable: true })
  location?: string;

  @Column({ name: 'qr_code_token', length: 255, unique: true })
  qrCodeToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Event, event => event.booths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => ScanRecord, scanRecord => scanRecord.booth)
  scanRecords: ScanRecord[];
}