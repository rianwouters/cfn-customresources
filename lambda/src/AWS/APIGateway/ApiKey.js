'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class ApiKey extends CustomAWSResource {

    constructor() {
        super('APIGateway');
    }

    Existing(req) {
        const {stageKeys, value} = req.ResourceProperties;
        console.log(`findExisting: Looking for ${value} ${JSON.stringify(stageKeys)}`);
        return this.service.getApiKeys({includeValues: true}).promise()
            .then(({items}) => {
                const key = items.find(i => i.value === value);
                if (!key) throw new Error('Not found');
                return this.service.updateApiKey({
                    apiKey : key.id,
                    patchOperations: stageKeys.map(k => ({
                        op: 'add',
                        path: '/stages',
                        value: `${k.restApiId}/${k.stageName}`
                    }))
                }).promise().then(() => {
                    const res = this.response(key);
                    req.PhysicalResourceId = res.Id;
                    return res;
                })
            })
    }

    Create(req) {
        return this.Existing(req).catch(() => super.Create(req));
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