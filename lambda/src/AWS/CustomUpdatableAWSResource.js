'use strict';
const CustomAWSResource = require('./CustomAWSResource.js');

module.exports = class CustomUpdatableAWSResource extends CustomAWSResource {

    updateParams() {
        return Object.assign(this.createParams(), {Id: this.physicalId});
    }

    Update() {
        const update = this.serviceMethod('update');
        return update().then(data => this.response(data));
    }

};