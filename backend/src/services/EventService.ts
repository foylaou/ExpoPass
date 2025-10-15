import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Event } from '../entities/Event';
import { CreateEventDto, UpdateEventDto } from '../dto/EventDto';

@Service()
export class EventService {
  private eventRepository: Repository<Event>;

  constructor() {
    // 延遲初始化以確保 AppDataSource 已連接
    this.eventRepository = AppDataSource.getRepository(Event);
  }

  private get repository(): Repository<Event> {
    if (!this.eventRepository || !AppDataSource.isInitialized) {
      this.eventRepository = AppDataSource.getRepository(Event);
    }
    return this.eventRepository;
  }

  async findAll(): Promise<Event[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: string): Promise<Event | null> {
    return await this.repository.findOne({
      where: { id }
    });
  }

  async findByEventCode(eventCode: string): Promise<Event | null> {
    return await this.repository.findOne({
      where: { eventCode }
    });
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.repository.create({
      ...createEventDto,
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
    });
    
    return await this.repository.save(event);
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event | null> {
    const event = await this.findById(id);
    if (!event) {
      return null;
    }

    const updateData: any = { ...updateEventDto };
    
    if (updateEventDto.startDate) {
      updateData.startDate = new Date(updateEventDto.startDate);
    }
    
    if (updateEventDto.endDate) {
      updateData.endDate = new Date(updateEventDto.endDate);
    }

    await this.repository.merge(event, updateData);
    return await this.repository.save(event);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async findWithAttendees(id: string): Promise<Event | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['attendees']
    });
  }

  async findWithBooths(id: string): Promise<Event | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['booths']
    });
  }

  async findWithScanRecords(id: string): Promise<Event | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['scanRecords', 'scanRecords.attendee', 'scanRecords.booth']
    });
  }
}