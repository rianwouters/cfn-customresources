'use strict';
const CustomAWSResource = require('./CustomAWSResource.js');
const AWS = require('aws-sdk');

module.exports = class APIGatewayDeployment extends CustomAWSResource {

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