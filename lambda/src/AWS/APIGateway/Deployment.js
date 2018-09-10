'use strict';
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class Deployment extends CustomAWSResource {

    constructor(req) {
        super(req, 'APIGateway');
    }

    delete() {
        return this.resourceMethod('delete')({
            deploymentId: this.physicalId,
            restApiId: this.props.restApiId
        });
    }

    Create() {
        if (this.props.stageName) return Promise.reject(new Error("stageName not allowed"));
        if (this.props.stageDescription) return Promise.reject(new Error("stageDescription not allowed"));
        return this.create().then(data => {
            this.physicalId = data.id;
            return {Id: data.id};
        })
    }
};