-- FPGA Code in VHDL
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.STD_LOGIC_ARITH.ALL;
use IEEE.STD_LOGIC_UNSIGNED.ALL;

entity SmartHomeFPGA is
    Port ( clk : in STD_LOGIC;
           sensor_in : in STD_LOGIC_VECTOR(7 downto 0);
           actuator_out : out STD_LOGIC_VECTOR(7 downto 0));
end SmartHomeFPGA;

architecture Behavioral of SmartHomeFPGA is
begin
    process(clk)
    begin
        if rising_edge(clk) then
            actuator_out <= sensor_in; -- Simple pass-through for demonstration
        end if;
    end process;
end Behavioral;


// Microcontroller (Arduino C/C++)
//This Arduino code reads data from the FPGA and communicates it to a web server:

#include <WiFi.h>

const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";
WiFiServer server(80);

const int sensorPin = 34; // Analog input pin for sensor
const int actuatorPin = 32; // Digital output pin for actuator

void setup() {
  Serial.begin(115200);
  pinMode(sensorPin, INPUT);
  pinMode(actuatorPin, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    String request = client.readStringUntil('\r');
    client.flush();
    
    int sensorValue = analogRead(sensorPin);
    digitalWrite(actuatorPin, sensorValue > 512 ? HIGH : LOW);

    String response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n";
    response += "<!DOCTYPE HTML><html><body>";
    response += "Sensor Value: " + String(sensorValue) + "<br>";
    response += "Actuator State: " + String(sensorValue > 512 ? "ON" : "OFF") + "<br>";
    response += "</body></html>";
    
    client.print(response);
    delay(10);
    client.stop();
  }
}


// Web Interface (HTML + JavaScript)
// A simple HTML page to interact with the home automation system:

<!DOCTYPE html>
<html>
<head>
    <title>Smart Home Automation</title>
</head>
<body>
    <h1>Smart Home Automation</h1>
    <p id="sensorData">Loading...</p>
    <button onclick="toggleActuator()">Toggle Actuator</button>

    <script>
        function getData() {
            fetch('/').then(response => response.text()).then(data => {
                document.getElementById('sensorData').innerHTML = data;
            });
        }

        function toggleActuator() {
            fetch('/toggle').then(response => response.text()).then(data => {
                document.getElementById('sensorData').innerHTML = data;
            });
        }

        setInterval(getData, 1000);
    </script>
</body>
</html>
