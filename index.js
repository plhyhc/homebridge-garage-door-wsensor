var gpio = require('pi-gpio');
let Service, Characteristic, TargetDoorState, CurrentDoorState;
const OFF = true;
const ON = false;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  TargetDoorState = Characteristic.TargetDoorState;
  CurrentDoorState = Characteristic.CurrentDoorState;
  DoorState = homebridge.hap.Characteristic.CurrentDoorState;
  homebridge.registerAccessory('homebridge-garage-door-opener', 'Garage Door Opener', GarageDoorOpener);
};

class GarageDoorOpener {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.doorRelayPin = config.doorRelayPin;
    this.doorSensorPin = config.doorSensorPin;
    this.checkSensor();
    this.currentDoorState = CurrentDoorState.CLOSED;
    this.targetDoorState = TargetDoorState.CLOSED;
    this.DoorState = 1;
    this.pinChange = 0;
  }

  identify(callback) {
    this.log('Identify requested!');
    callback(null);
  }

  openCloseGarage(callback) {
    var self = this;
    gpio.open(self.doorRelayPin, 'output', function() {
          gpio.write(self.doorRelayPin, 1, function() {
              // SET VALUE 1 TO SET RELAY HIGH
          });
      });
    setTimeout(() => {
      gpio.open(self.doorRelayPin, 'output', function() {
            gpio.write(self.doorRelayPin, 0, function() {
                // SET VALUE 0 TO SET RELAY LOW
            });
        });
        }, 700);
  }

  checkSensor(){
    var self = this;
    setTimeout(function(){
      gpio.open(self.doorSensorPin, 'input', function() {
        gpio.read(self.doorSensorPin, function(gself,value) {
          if(value === 1){
              if(self.DoorState != value){
                self.pinChange = 1;
                self.service.setCharacteristic(TargetDoorState, TargetDoorState.OPEN);
              }
              self.pinChange = 0;
              self.service.setCharacteristic(CurrentDoorState, CurrentDoorState.OPEN);
              self.targetDoorState = 0;
          } else {
            if(self.DoorState != value){
              self.pinChange = 1;
              self.service.setCharacteristic(TargetDoorState, TargetDoorState.CLOSED);
            }
            self.pinChange = 0;
            self.service.setCharacteristic(CurrentDoorState, CurrentDoorState.CLOSED);
            self.targetDoorState = 1;
          }
          self.DoorState = value;
          self.checkSensor();
        });
      });
    },500);
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Encore Dev Labs')
      .setCharacteristic(Characteristic.Model, 'Kraft Garage Door Opener')
      .setCharacteristic(Characteristic.SerialNumber, 'Raspberry Pi');

    this.service = new Service.GarageDoorOpener(this.name, this.name);
    this.service.setCharacteristic(TargetDoorState, TargetDoorState.CLOSED);
    this.service.setCharacteristic(CurrentDoorState, CurrentDoorState.CLOSED);

    this.service.getCharacteristic(TargetDoorState)
      .on('get', (callback) => {
        callback(null, this.targetDoorState);
      })
      .on('set', (value, callback) => {
        this.targetDoorState = value;
        if (this.targetDoorState === TargetDoorState.OPEN) {
          if(this.pinChange == 0 ){
            this.openCloseGarage();
          }
        } else if (this.targetDoorState === TargetDoorState.CLOSED) {
          if(this.pinChange == 0 ){
            this.openCloseGarage();
          }
        }
        this.pinChange = 0;
        callback();
      });
    this.service
      .getCharacteristic(Characteristic.Name)
      .on('get', callback => {
        callback(null, this.name);
      });

    return [informationService, this.service];
  }
}
