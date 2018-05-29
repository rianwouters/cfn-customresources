'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class ApiKey extends CustomAWSResource {

    constructor() {
        super('APIGateway');
    }

    detachExisting({ResourceProperties: stageKeys}) {
        const patchOperations = stageKeys.map(({restApiId, stageName}) => {
            op: 'remove',
            value: `${restApiId}/${stageName}`,
            from: '/stageKeys'
        });
        console.log(`patchOperations ${JSON.stringify(patchOperations)}`);
        return this.service.getApiKeys().promise().then(({items}) => Promise.all(
            items.map(({id}) => this.service.updateApiKey({apiKey: id, patchOperations}).promise())
        ))
    }

    Create(req) {
        this.detachExisting(req).then(() => super.Create(req));
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