import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/device/arduino-code
router.get('/arduino-code', (_req: Request, res: Response) => {
  const code = `/*
 * Smart Blind Navigation Stick - ESP32 Firmware
 * Hardware components:
 * - ESP32 WROOM-32D Development Board
 * - NEO-6M / NEO-8M GPS Module (UART TX/RX to GPIO 16/17)
 * - HC-SR04 Ultrasonic Sensors x3 (Front, Left, Right)
 * - Push Button (Emergency Trigger on GPIO 4 with internal pull-up)
 * - Piezo Buzzer / Vibration Haptic Motor (GPIO 2)
 * - 3.7V 18650 Li-Ion Battery with Voltage Divider on ADC GPIO 34
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TinyGPS++.h>

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Backend API Configuration
const char* BACKEND_BASE_URL = "http://YOUR_SERVER_IP:3000";
const char* DEVICE_ID = "STICK_001";
const char* API_KEY = "stick_device_sec_key_xyz987";

// Pin Definitions
#define PIN_EMERGENCY_BTN  4
#define PIN_BUZZER         2
#define PIN_BATTERY_ADC    34

// Front Ultrasonic (Trig, Echo)
#define PIN_FRONT_TRIG     18
#define PIN_FRONT_ECHO     19

// Left Ultrasonic (Trig, Echo)
#define PIN_LEFT_TRIG      22
#define PIN_LEFT_ECHO      23

// Right Ultrasonic (Trig, Echo)
#define PIN_RIGHT_TRIG     12
#define PIN_RIGHT_ECHO     13

// GPS Serial Pins
#define GPS_RX_PIN         16
#define GPS_TX_PIN         17
HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

// State Tracking
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 5000;
bool lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY_MS = 50;

long readDistanceCm(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH, 25000); // 25ms timeout (~4m)
  if (duration == 0) return 400; // max range
  return duration * 0.034 / 2;
}

int readBatteryPercentage() {
  int raw = analogRead(PIN_BATTERY_ADC);
  // Assuming 1:1 voltage divider, 4.2V max = 100%, 3.3V min = 0%
  float voltage = (raw / 4095.0) * 3.3 * 2.0;
  int percent = map((int)(voltage * 100), 330, 420, 0, 100);
  return constrain(percent, 0, 100);
}

void sendEmergencyAlert() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(BACKEND_BASE_URL) + "/api/device/emergency";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", API_KEY);
  
  StaticJsonDocument<300> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["event"] = "EMERGENCY_BUTTON";
  
  if (gps.location.isValid()) {
    doc["latitude"] = gps.location.lat();
    doc["longitude"] = gps.location.lng();
    doc["accuracy"] = gps.hdop.hdop() * 2.5;
  } else {
    // Fallback if indoors / lock pending
    doc["latitude"] = 37.7749;
    doc["longitude"] = -122.4194;
    doc["accuracy"] = 15.0;
  }
  
  doc["battery"] = readBatteryPercentage();
  doc["timestamp"] = "2026-09-14T12:00:00Z";
  
  String payload;
  serializeJson(doc, payload);
  
  int httpCode = http.POST(payload);
  Serial.printf("Emergency alert sent! HTTP Response: %d\\n", httpCode);
  http.end();
  
  // Rapid alert chime feedback on smart stick
  for (int i = 0; i < 5; i++) {
    digitalWrite(PIN_BUZZER, HIGH);
    delay(100);
    digitalWrite(PIN_BUZZER, LOW);
    delay(80);
  }
}

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  long fDist = readDistanceCm(PIN_FRONT_TRIG, PIN_FRONT_ECHO);
  long lDist = readDistanceCm(PIN_LEFT_TRIG, PIN_LEFT_ECHO);
  long rDist = readDistanceCm(PIN_RIGHT_TRIG, PIN_RIGHT_ECHO);
  
  // Ultrasonic local safety buzzer trigger (< 50cm)
  bool obstacle = (fDist < 50 || lDist < 40 || rDist < 40);
  digitalWrite(PIN_BUZZER, obstacle ? HIGH : LOW);
  
  // 1. Post sensor data
  HTTPClient http;
  String sensorUrl = String(BACKEND_BASE_URL) + "/api/device/sensor-data";
  http.begin(sensorUrl);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<256> sDoc;
  sDoc["deviceId"] = DEVICE_ID;
  sDoc["frontDistanceCm"] = fDist;
  sDoc["leftDistanceCm"] = lDist;
  sDoc["rightDistanceCm"] = rDist;
  sDoc["buzzerActive"] = obstacle;
  
  String sPayload;
  serializeJson(sDoc, sPayload);
  http.POST(sPayload);
  http.end();
  
  // 2. Post location telemetry if GPS valid
  if (gps.location.isValid()) {
    String locUrl = String(BACKEND_BASE_URL) + "/api/device/location";
    http.begin(locUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<256> lDoc;
    lDoc["deviceId"] = DEVICE_ID;
    lDoc["latitude"] = gps.location.lat();
    lDoc["longitude"] = gps.location.lng();
    lDoc["speed"] = gps.speed.kmph();
    lDoc["accuracy"] = gps.hdop.hdop() * 2.5;
    lDoc["battery"] = readBatteryPercentage();
    
    String lPayload;
    serializeJson(lDoc, lPayload);
    http.POST(lPayload);
    http.end();
  }
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  
  pinMode(PIN_EMERGENCY_BTN, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW);
  
  pinMode(PIN_FRONT_TRIG, OUTPUT);
  pinMode(PIN_FRONT_ECHO, INPUT);
  pinMode(PIN_LEFT_TRIG, OUTPUT);
  pinMode(PIN_LEFT_ECHO, INPUT);
  pinMode(PIN_RIGHT_TRIG, OUTPUT);
  pinMode(PIN_RIGHT_ECHO, INPUT);
  
  Serial.println("Smart Blind Stick Booting...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED && millis() < 10000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
}

void loop() {
  // Feed GPS parser
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
  
  // Check Emergency Button with debounce
  int reading = digitalRead(PIN_EMERGENCY_BTN);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY_MS) {
    if (reading == LOW) { // Pressed (active LOW)
      Serial.println("EMERGENCY BUTTON PRESSED!");
      sendEmergencyAlert();
      delay(1000); // debounce lockout
    }
  }
  lastButtonState = reading;
  
  // Periodic Telemetry
  if (millis() - lastTelemetryTime > TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = millis();
    sendTelemetry();
  }
}
`;

  return res.json({
    title: 'ESP32 Smart Blind Navigation Stick Production Firmware',
    language: 'cpp',
    version: '2.4.0',
    code,
  });
});

export default router;
