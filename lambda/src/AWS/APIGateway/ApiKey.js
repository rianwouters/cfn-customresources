'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class ApiKey extends CustomAWSResource {

    constructor(req) {
        super(req, 'APIGateway');
    }

    deleteExisting({ResourceProperties: {value}}) {
        return this.service.getApiKeys({includeValues: true}).promise()
            .then(({items}) => items.find(i => i.value === value))
            .then(key => !key || this.Delete({PhysicalResourceId: key.id}));
    }

    Create(req) {
        return this.deleteExisting(req).then(() => super.Create(req));
    }

    createParams(req) {
        const params = super.createParams(req);
        if (!params.name) params.name = this.Name(req);
        if (params.enabled) params.enabled = (params.enabled === 'true');
        return params;
    }

    deleteParams(req) {
        return {apiKey: req.PhysicalResourceId};
    }

    response(data) {
        return {Id: data.id};
    }
};