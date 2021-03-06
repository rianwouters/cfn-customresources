'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class ApiKey extends CustomAWSResource {

    constructor(req) {
        super(req);
        if (!this.props.name) this.props.name = this.Name();
        if (this.props.enabled) this.props.enabled = (this.props.enabled === 'true');
    }

    delete() {
        return this.resourceMethod('delete')({apiKey: this.physicalId});
    }

    all() {
        return this.serviceMethod('getApiKeys')(({includeValues: true}));
    }

    deleteExistingValue() {
        return this.all()
            .then(({items}) => items.find(i => i.value === this.props.value))
            .then(key => !key || this.resourceMethod('delete')({apiKey: key.id}));
    }

    Create() {
        return this.deleteExistingValue()
            .then(
                () => super.Create(),
                () => super.Create()
            );
    }

    getPhysicalId(data) {
        return data.id;
    }

};