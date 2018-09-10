'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class Deployment extends CustomAWSResource {

    constructor(req) {
        super(req, 'APIGateway');
    }

    deleteParams(req) {
        return {
            deploymentId: req.PhysicalResourceId,
            restApiId: req.ResourceProperties.restApiId
        };
    }

    Create(req) {
        if (req.ResourceProperties.stageName) return Promise.reject(new Error("stageName not allowed"));
        if (req.ResourceProperties.stageDescription) return Promise.reject(new Error("stageDescription not allowed"));
        return super.Create(req);
    }

    response(data) {
        return { Id: data.id };
    }
};