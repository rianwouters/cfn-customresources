'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class ApiKey extends CustomAWSResource {

    constructor() {
        super('APIGateway');
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