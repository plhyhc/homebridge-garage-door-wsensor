# Homebridge Pi Garage Door Opener

This is a [homebridge](https://github.com/nfarina/homebridge) plugin to make a Raspberry Pi connected with a Relay Board into a Garage Door Opener via the Home app on iOS using Homekit.  It uses a magnetic switch to determine the state of the garage door, open or closed.

Just add the following config to your homebridge config file located at this path `~/.homebridge/config.json`.

Homebridge works best I have found when run in sudo.

```
sudo homebridge
```

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
