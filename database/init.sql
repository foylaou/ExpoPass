-- ExpoPass 資料庫架構
-- 建立日期: 2025-10-15

-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 展覽活動表 (events)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(200) NOT NULL,
    event_code VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(300),
    description TEXT,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. 參展人員表 (attendees)
-- ============================================
CREATE TABLE IF NOT EXISTS attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(200),
    title VARCHAR(100),
    phone VARCHAR(50),
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    badge_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_email_per_event UNIQUE (event_id, email)
);

-- ============================================
-- 3. 攤位表 (booths)
-- ============================================
CREATE TABLE IF NOT EXISTS booths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    booth_number VARCHAR(50) NOT NULL,
    booth_name VARCHAR(200) NOT NULL,
    company VARCHAR(200),
    description TEXT,
    location VARCHAR(200),
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_booth_per_event UNIQUE (event_id, booth_number)
);

-- ============================================
-- 4. 掃描記錄表 (scan_records)
-- ============================================
CREATE TABLE IF NOT EXISTS scan_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendee_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
    booth_id UUID NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- ============================================
-- 建立索引以提升查詢效能
-- ============================================

-- Events 索引
CREATE INDEX IF NOT EXISTS idx_events_event_code ON events(event_code);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);

-- Attendees 索引
CREATE INDEX IF NOT EXISTS idx_attendees_event_id ON attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_qr_token ON attendees(qr_code_token);
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_company ON attendees(company);

-- Booths 索引
CREATE INDEX IF NOT EXISTS idx_booths_event_id ON booths(event_id);
CREATE INDEX IF NOT EXISTS idx_booths_qr_token ON booths(qr_code_token);
CREATE INDEX IF NOT EXISTS idx_booths_booth_number ON booths(booth_number);

-- Scan Records 索引
CREATE INDEX IF NOT EXISTS idx_scan_records_attendee_id ON scan_records(attendee_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_booth_id ON scan_records(booth_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_event_id ON scan_records(event_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_scanned_at ON scan_records(scanned_at);
CREATE INDEX IF NOT EXISTS idx_scan_records_date ON scan_records(DATE(scanned_at));

-- 複合索引(常用查詢組合)
CREATE INDEX IF NOT EXISTS idx_scan_records_booth_date ON scan_records(booth_id, DATE(scanned_at));
CREATE INDEX IF NOT EXISTS idx_scan_records_event_date ON scan_records(event_id, DATE(scanned_at));

-- ============================================
-- 自動更新 updated_at 的觸發器
-- ============================================

-- 建立觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 events 表建立觸發器
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 為 attendees 表建立觸發器
DROP TRIGGER IF EXISTS update_attendees_updated_at ON attendees;
CREATE TRIGGER update_attendees_updated_at
    BEFORE UPDATE ON attendees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();