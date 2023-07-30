# Homebridge Pi Garage Door Opener With Sensor


This is a [homebridge](https://github.com/nfarina/homebridge) plugin to make a Raspberry Pi connected with a Relay Board into a Garage Door Opener, via the Home app on iOS using Homekit.  It uses a magnetic switch to determine the state of the garage door, open or closed. The wires from the Relay go into the same ports as the wired button for the garage door. When the Relay closes the circuit it acts like the button was pushed. Tested with iOS 13.

### How to Setup

Both homebridge and this package will be installed globally with the following commands.

```
sudo npm install -g --unsafe-perm homebridge
sudo npm install -g --unsafe-perm homebridge-garage-door-wsensor
```
Rename config.sample.json to config.json and place in .homebridge/config.json


### How to Start
Run the following command
```
homebridge
```

### Sample Config

Rename config.sample.json to config.json and place in .homebridge/config.json
Most likely you will need to play with the settings for the door sensor.  Depending on your hardware configuration you may need to try different settings for "invertSensorState" (true, flase) and "input_pull" (up, down, off).

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
    "doorSensorPin": 16,
    "invertDoorState": false,
    "invertSensorState": true,
    "input_pull": "up",
    "duration_ms": 500
  }]
}
```


### Start on boot

Have the "homebridge" command run at boot.
- Enter command "sudo raspi-config" 
- Select "Boot Options"
- Select "B1 Desktop / CLI"
- Select "B2 Console AutoLogin"
- Confirm and Finish
- Edit ~/.bashrc file. At the very end of the file add the command "homebridge". This command will be executed at boot up after auto-login as pi user.



