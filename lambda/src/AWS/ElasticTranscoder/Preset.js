'use strict';
const CustomUpdatableAWSResource = require('../CustomUpdatableAWSResource.js');

module.exports = class Preset extends CustomUpdatableAWSResource {

    constructor(req) {
        super(req);
        if (!this.props.Name) this.props.Name = this.Name();
    }

    Create() {
        return super.Create().then(data => data[this.type]);
    }

    Update() {
        return super.Update().then(data => data[this.type]);
    }

    getPhysicalId(data) {
        return data[this.type].Id;
    }
};