'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class ApiKey extends CustomAWSResource {

    constructor(req) {
        super(req, 'APIGateway');
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
            .then(key => !key || this.Delete({PhysicalResourceId: key.id}));
    }

    Create() {
        return this.deleteExistingValue()
            .then(() => this.create())
            .then(data => {
                this.physicalId = data.id;
                return {Id: data.id};
            });
    }
};