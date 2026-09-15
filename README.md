# Smart Blind Navigation Stick — Caregiver Emergency & Navigation System

A production-grade, accessible full-stack IoT and Caregiver monitoring system for visually impaired users.
Communicates with an **ESP32 microcontroller** embedded in the smart walking stick equipped with GPS, ultrasonic distance sensors, buzzer, and physical emergency push button.

---

## 🎯 System Workflow

```
[ ESP32 Smart Stick ]
        │
        ├── Push Button Pressed
        ├── GPS Module reads Lat/Lng
        ├── Ultrasonic sensors scan obstacles
        │
        ▼ (HTTP REST / MQTT)
[ Express Backend Gateway ]
        │
        ├── Authenticates Device (X-Device-Key)
        ├── Identifies Registered Blind User & Caregiver
        ├── Fetches Real-Time GPS Coordinates
        ├── Creates Emergency Event
        ├── Dispatches Alerts (SMS, Email, Push) to Emergency Contacts
        │
        ▼
[ Caregiver Web / Mobile Portal ]
        ├── Instant Full-Screen Emergency Modal with Pulsing Beacon
        ├── Direct Clickable Google Maps Route Link
        ├── Emergency Countdown & Safe Cancellation Trigger
        ├── 3-Way Ultrasonic Obstacle Radar (Front, Left, Right)
        ├── Live GPS Location Tracking
        └── Device Health (Battery, Satellites, WiFi Signal)
```

---

## 📡 ESP32 Hardware Integration

### Hardware Bill of Materials (BOM)
1. **Microcontroller**: ESP32 WROOM-32D Development Board (Dual-core 240MHz, WiFi & BLE)
2. **GPS Module**: u-blox NEO-6M / NEO-8M (UART pins TX: GPIO 17, RX: GPIO 16)
3. **Ultrasonic Range Sensors**: HC-SR04 x3 (Front: Trig 18/Echo 19, Left: Trig 22/Echo 23, Right: Trig 12/Echo 13)
4. **Physical Emergency Push Button**: Momentary tactile switch (GPIO 4 to GND with internal PULLUP)
5. **Acoustic / Haptic Feedback**: Active 5V Piezo Buzzer & Mini Vibration Motor (GPIO 2)
6. **Power Source**: 3.7V 18650 3000mAh Rechargeable Li-Ion cell + TP4056 USB charger + Voltage divider to ADC GPIO 34

### Emergency Button Payload (ESP32 -> Backend)
```http
POST /api/device/emergency HTTP/1.1
Host: your-server-domain.com
Content-Type: application/json
X-Device-Key: stick_device_sec_key_xyz987

{
  "deviceId": "STICK_001",
  "event": "EMERGENCY_BUTTON",
  "latitude": 37.7764,
  "longitude": -122.4163,
  "accuracy": 3.2,
  "battery": 82,
  "timestamp": "2026-09-14T11:30:00Z"
}
```

### Telemetry Payload (ESP32 -> Backend)
```http
POST /api/device/sensor-data HTTP/1.1
Content-Type: application/json

{
  "deviceId": "STICK_001",
  "frontDistanceCm": 85,
  "leftDistanceCm": 120,
  "rightDistanceCm": 35,
  "buzzerActive": true
}
```

---

## 🚀 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Caregiver authentication with JWT token |
| `POST` | `/api/auth/register` | Register new caregiver and linked blind user |
| `GET`  | `/api/users/profile` | Caregiver & patient profile with medical info |
| `GET`  | `/api/contacts` | List registered emergency contacts |
| `POST` | `/api/contacts` | Add emergency contact with priority & alert channels |
| `PUT`  | `/api/contacts/:id` | Update contact info |
| `DELETE` | `/api/contacts/:id` | Remove contact |
| `GET`  | `/api/device/status` | Read live stick telemetry, battery & sensor radar |
| `POST` | `/api/device/location` | Ingest GPS location telemetry from stick |
| `POST` | `/api/device/emergency` | **Trigger hardware emergency push button** |
| `POST` | `/api/device/emergency/cancel` | Cancel false alarm within countdown window |
| `POST` | `/api/device/emergency/resolve` | Caregiver marks alert as resolved |
| `GET`  | `/api/emergency/history` | Historical log of all emergency events |
| `GET`  | `/api/location/history` | Historical trackpoints with date filter |
| `POST` | `/api/simulation/trigger` | Trigger simulated button, GPS movement, obstacle, battery |
| `GET`  | `/api/hardware/arduino-code` | Download ready-to-flash ESP32 C++ Arduino sketch |

---

## 🔒 Security & Privacy
- **Device Authentication**: ESP32 validates with secret device token.
- **Sensitive GPS Data Access**: Location and emergency streams are restricted to authenticated caregivers.
- **Auditable History**: Every dispatch, cancellation, and resolution is permanently timestamped.
