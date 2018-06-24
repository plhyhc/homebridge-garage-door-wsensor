# Homebridge Pi Garage Door Opener

[![Build Status](https://travis-ci.org/plhyhc/homebridge-garage-door-wsensor.svg?branch=master)](https://travis-ci.org/plhyhc/homebridge-garage-door-wsensor)


This is a [homebridge](https://github.com/nfarina/homebridge) plugin to make a Raspberry Pi connected with a Relay Board into a Garage Door Opener via the Home app on iOS using Homekit.  It uses a magnetic switch to determine the state of the garage door, open or closed.

Homebridge works best I have found when run in sudo.


### Sample Config

Config to be placed in .homebridge/config.json
If you run homebridge from sudo, place config in /root/.homebridge/config.json
If you run homebridge without sudo, place config in /home/pi/.homebridge/config.json

```json
{
  "bridge": {
      "name": "Garage Homebridge",
      "username": "CC:22:3D:E3:CE:30",
      "port": 51826,
      "pin":"031-45-154",
      "manufacturer": "@nfarina",
      "model": "Homebridge",
      "serialNumber": "0.4.20"
  },
  "description": "The garage home bridge",
  "accessories": [{
    "accessory": "Garage Door Opener",
    "name": "Garage Door",
    "doorRelayPin": 11,
    "doorSensorPin": 10
  }]
}
```

### How to Setup

```
sudo apt-get install libavahi-compat-libdnssd-dev
sudo npm install -g --unsafe-perm homebridge
sudo npm install -g homebridge-garage-door-wsensor
sudo homebridge
```