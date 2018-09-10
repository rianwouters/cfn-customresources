'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class ApiKey extends CustomAWSResource {

    constructor(req) {
        super(req, 'APIGateway');
    }

    deleteExistingValue() {
        return this.service.getApiKeys({includeValues: true}).promise()
            .then(({items}) => items.find(i => i.value === this.props.value))
            .then(key => !key || this.Delete({PhysicalResourceId: key.id}));
    }

    Create() {
        return this.deleteExistingValue().then(() => super.Create());
    }

    createParams() {
        const params = super.createParams();
        if (!params.name) params.name = this.Name();
        if (params.enabled) params.enabled = (params.enabled === 'true');
        return params;
    }

    deleteParams() {
        return {apiKey: this.physicalId};
    }

    response(data) {
        return {Id: data.id};
    }
};