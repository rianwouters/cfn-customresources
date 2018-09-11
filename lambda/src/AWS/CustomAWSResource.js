'use strict';
const CustomResource = require('../CustomResource.js');
const AWS = require('aws-sdk');

module.exports = class CustomAWSResource extends CustomResource {

    constructor(req, serviceName) {
        super(req);
        console.log("Creating", serviceName);
        console.log("type:", this.type);
        const region = this.props.Region || AWS.config.region;
        delete this.props.Region;
        this.service = new AWS[serviceName]({region: region});
    }

    create() {
        this.resourceMethod('create')(this.props).then(data => {
            this.physicalId = getPhysicalId(data);
            return data;
        });
    }

    delete() {
        this.resourceMethod('delete')({Id: this.physicalId});
    }

    get type() {
        return this.constructor.name;
    }

    serviceMethod(name) {
        console.log('serviceMethod:', name);
        return (...args) => (console.log(JSON.stringify(args)), this.service[name](...args).promise());
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