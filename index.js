var Service, Characteristic, TargetDoorState, CurrentDoorState;
var rpio = require('rpio');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    TargetDoorState = Characteristic.TargetDoorState;
    CurrentDoorState = Characteristic.CurrentDoorState;
    DoorState = homebridge.hap.Characteristic.CurrentDoorState;
    homebridge.registerAccessory('homebridge-garage-door-wsensor', 'Garage Door Opener', GarageDoorOpener);
}

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.doorRelayPin = config.doorRelayPin;
    this.doorSensorPin = config.doorSensorPin;
    this.currentDoorState = CurrentDoorState.CLOSED;
    this.targetDoorState = TargetDoorState.CLOSED;
    this.invertDoorState = defaultVal(config["invertDoorState"], false);
    this.invertSensorState = defaultVal(config['invertSensorState'], false);
    this.default = defaultVal(config["default_state"], false);
    this.duration = defaultVal(config["duration_ms"], 0);
    this.pullConfig = defaultVal(config["input_pull"], "none");
    this.doorState = 0;
    this.sensorChange = 0;
    this.service = null;

    if (!this.doorRelayPin) throw new Error("You must provide a config value for 'doorRelayPin'.");
    if (!this.doorSensorPin) throw new Error("You must provide a config value for 'doorSensorPin'.");
    if (!is_int(this.duration)) throw new Error("The config value 'duration' must be an integer number of milliseconds.");

    this.log("Creating a garage door relay named '%s', initial state: %s", this.name, (this.invertDoorState ? "OPEN" : "CLOSED"));
    rpio.open(this.doorRelayPin, rpio.OUTPUT, this.gpioDoorVal(this.invertDoorState));
    rpio.open(this.doorSensorPin, rpio.INPUT, this.translatePullConfig(this.pullConfig));
    this.checkSensor(e => {});
}

GarageDoorOpener.prototype.getServices = function () {
    this.service = new Service.GarageDoorOpener(this.name, this.name);
    this.service.setCharacteristic(TargetDoorState, TargetDoorState.CLOSED);
    this.service.setCharacteristic(CurrentDoorState, CurrentDoorState.CLOSED);
    this.service.getCharacteristic(CurrentDoorState)
		.on('get', this.getSensorStatus.bind(this))
    this.service.getCharacteristic(TargetDoorState)
		.on('get', this.getSensorStatus.bind(this))
		.on('set', this.setDoorState.bind(this));
    return [this.service];
}

GarageDoorOpener.prototype.getSensorStatus = function (callback) {
    callback(null, this.readSensorState());
}

GarageDoorOpener.prototype.checkSensor = function (callback) {
	setTimeout(e => {
		this.doorState = this.readSensorState();
		if (this.doorState !== this.sensorChange){
			this.service.getCharacteristic(TargetDoorState).updateValue(this.doorState);
			this.service.getCharacteristic(CurrentDoorState).updateValue(this.doorState);
			this.sensorChange = this.doorState;
		}
		this.checkSensor(callback);
	}, 500);

	callback(null);
}

GarageDoorOpener.prototype.readSensorState = function () {
	var val = this.gpioSensorVal(rpio.read(this.doorSensorPin));
	return val == rpio.HIGH ? CurrentDoorState.CLOSED : CurrentDoorState.OPEN;
}

GarageDoorOpener.prototype.setState = function (val) {
	rpio.write(this.doorRelayPin, this.gpioDoorVal(val));
}

GarageDoorOpener.prototype.setDoorState = function (newState, callback) {
        nowState = this.readSensorState();
    	this.log("Requesting new state %s, current state %s", newState, nowState);
        if (newState == nowState) {
    		this.log("Already in requested state, doing nothing.");
		callback(null);
		return;
	}
	if (newState == TargetDoorState.CLOSED) {
		this.service.getCharacteristic(TargetDoorState).updateValue(TargetDoorState.OPEN);
		this.service.getCharacteristic(CurrentDoorState).updateValue(CurrentDoorState.OPENING);
        } else if (newState == TargetDoorState.OPEN) {
		this.service.getCharacteristic(TargetDoorState).updateValue(TargetDoorState.CLOSED);
		this.service.getCharacteristic(CurrentDoorState).updateValue(CurrentDoorState.CLOSING);
        }
	if (this.timerid !== -1) {
		clearTimeout(this.timerid);
		this.timerid = -1;
	}

	this.setState(1);

	if (this.duration > 0) {
		this.timerid = setTimeout(this.timeOutCB, this.duration, this);
	}

	callback(null);
}

GarageDoorOpener.prototype.timeOutCB = function (o) {
	o.setState(0);
	o.timerid = -1;
}

GarageDoorOpener.prototype.gpioSensorVal = function (val) {
	if (this.invertSensorState) val = !val;
	return val ? rpio.HIGH : rpio.LOW;
}

GarageDoorOpener.prototype.gpioDoorVal = function (val) {
	if (this.invertDoorState) val = !val;
	return val ? rpio.HIGH : rpio.LOW;
}

GarageDoorOpener.prototype.translatePullConfig = function(val)
{
	if (val == "up") return rpio.PULL_UP;
	else if (val == "down") return rpio.PULL_DOWN;
	else
		return rpio.PULL_OFF;
}


var is_int = function (n) {
	return n % 1 === 0;
}

var is_defined = function (v) {
	return typeof v !== 'undefined';
}

var defaultVal = function (v, dflt) {
	return is_defined(v) ? v : dflt;
}
