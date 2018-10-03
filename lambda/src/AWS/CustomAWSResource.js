'use strict';
const CustomResource = require('../CustomResource.js');
const AWS = require('aws-sdk');

module.exports = class CustomAWSResource extends CustomResource {

    constructor(req, context) {
        super(req, context);
        this.region = this.props.Region || AWS.config.region;
        delete this.props.Region;
        const serviceName = req.ResourceType.split('::')[1].split('-').slice(-2)[0];
        this.service = new AWS[serviceName]({region: this.region});
        console.log("Creating", serviceName, this.type);
    }

    create() {
        return this.resourceMethod('create')(this.props).then(data => {
            this.physicalId = this.getPhysicalId(data);
            return data;
        });
    }

    delete() {
        return this.resourceMethod('delete')({Id: this.physicalId});
    }

    get type() {
        return this.constructor.name;
    }

    serviceMethod(name) {
        const method = (...args) => this.service[name](...args).promise().catch(err => {
            if (err) console.log(typeof err, JSON.stringify(err));
            if ([err.constructor.name, err.code].includes("TooManyRequestsException")) return method(...args);
            throw err;
        });
        return method;
    }

    resourceMethod(name) {
        return this.serviceMethod(`${name}${this.type}`);
    }

    Create() {
        return this.create();
    }

    Update() {
        return this.Delete()
            .then(
                () => this.Create(),
                () => this.Create()
            )
    }

    Delete() {
        return this.delete()
            .catch(err => [err.constructor.name, err.code].includes("NotFoundException") || Promise.reject(err));
    }
};