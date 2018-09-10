'use strict';
const CustomAWSResource = require('./CustomAWSResource.js');

module.exports = class CustomUpdatableAWSResource extends CustomAWSResource {

    update() {
        return this.resourceMethod('update')(Object.assign(this.props, {Id: this.physicalId}));
    }

    Update() {
        return this.update().then(data => this.response(data));
    }

};