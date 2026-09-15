-- =========================================================================
-- Smart Blind Navigation Stick Emergency & Navigation System
-- Database Schema: PostgreSQL & MySQL compatible normalized DDL
-- =========================================================================

-- 1. Users table (Caregivers and Blind Users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role VARCHAR(20) DEFAULT 'caregiver', -- 'caregiver', 'patient', 'admin'
    avatar_url TEXT,
    address TEXT,
    blood_group VARCHAR(10),
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Devices table (ESP32 Smart Sticks)
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    is_connected BOOLEAN DEFAULT FALSE,
    battery_percentage INT DEFAULT 100,
    battery_voltage NUMERIC(4,2) DEFAULT 4.20,
    gps_status VARCHAR(20) DEFAULT 'available',
    emergency_button_status VARCHAR(20) DEFAULT 'ready',
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

-- 3. Caregiver Permissions table (Multi-caregiver authorization)
CREATE TABLE IF NOT EXISTS caregiver_permissions (
    id VARCHAR(36) PRIMARY KEY,
    caregiver_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(30) DEFAULT 'primary', -- 'primary', 'secondary', 'emergency_only'
    can_view_live_location BOOLEAN DEFAULT TRUE,
    can_receive_alerts BOOLEAN DEFAULT TRUE,
    authorized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_caregiver_patient ON caregiver_permissions(caregiver_id, patient_id);

-- 4. Emergency Contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    notification_preference VARCHAR(20) DEFAULT 'all', -- 'sms', 'call', 'email', 'push', 'all'
    priority VARCHAR(20) DEFAULT 'P1 - High', -- 'P1 - High', 'P2 - Medium', 'P3 - Low'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON emergency_contacts(user_id);

-- 5. Location Sharing Preferences
CREATE TABLE IF NOT EXISTS location_sharing (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(50) NOT NULL,
    live_tracking_enabled BOOLEAN DEFAULT TRUE,
    tracking_interval_seconds INT DEFAULT 5,
    last_toggle_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Locations table (GPS Trail & Telemetry)
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy NUMERIC(5, 2) NOT NULL, -- in meters
    speed NUMERIC(5, 2), -- km/h
    heading NUMERIC(5, 2), -- degrees
    gps_status VARCHAR(20) DEFAULT 'available',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_device_time ON locations(device_id, timestamp DESC);

-- 7. Device Sensor Data table (Ultrasonic obstacle telemetry)
CREATE TABLE IF NOT EXISTS device_sensor_data (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    front_distance_cm NUMERIC(6, 2) NOT NULL,
    left_distance_cm NUMERIC(6, 2) NOT NULL,
    right_distance_cm NUMERIC(6, 2) NOT NULL,
    front_obstacle BOOLEAN DEFAULT FALSE,
    left_obstacle BOOLEAN DEFAULT FALSE,
    right_obstacle BOOLEAN DEFAULT FALSE,
    buzzer_active BOOLEAN DEFAULT FALSE,
    voice_module_ready BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_data_device_time ON device_sensor_data(device_id, timestamp DESC);

-- 8. Emergency Events table
CREATE TABLE IF NOT EXISTS emergency_events (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) DEFAULT 'EMERGENCY_BUTTON',
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'cancelled', 'failed'
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy NUMERIC(5, 2) NOT NULL,
    address TEXT,
    battery_level INT,
    cancel_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emergency_events_status ON emergency_events(status);
CREATE INDEX IF NOT EXISTS idx_emergency_events_timestamp ON emergency_events(timestamp DESC);

-- 9. Notifications table (Outbound alert records)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    emergency_event_id VARCHAR(36) REFERENCES emergency_events(id) ON DELETE CASCADE,
    recipient VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    channel_type VARCHAR(20) NOT NULL, -- 'SMS', 'EMAIL', 'PUSH'
    status VARCHAR(20) DEFAULT 'sending', -- 'sending', 'sent', 'delivered', 'failed'
    message_text TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    google_maps_url TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_event_id ON notifications(emergency_event_id);
