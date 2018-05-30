'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class ApiKey extends CustomAWSResource {

    constructor() {
        super('APIGateway');
    }

    findExisting({ResourceProperties: {stageKeys, value}}) {
        stageKeys = stageKeys.map(k => `${k.restApiId}/${k.stageName}`);
        return this.service.getApiKeys({includeValues: true}).promise()
            .then(({items}) => items.find(i => i.value === value && JSON.stringify(i.stageKeys) === JSON.stringify(stageKeys)))
    }

    Create(req) {
        return this.findExisting(req).then(data => {
            if (data) {
                const res = this.response(data);
                req.PhysicalResourceId = res.Id;
                return res;
            } else return super.Create(req)
        });
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