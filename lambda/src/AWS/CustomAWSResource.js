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
        this.resourceMethod('create')(this.props);
    }

    read() {
        this.resourceMethod('read')({Id: this.physicalId});
    }

    delete() {
        this.resourceMethod('delete')({Id: this.physicalId});
    }

    get type() {
        return this.constructor.name;
    }

    serviceMethod(name) {
        console.log('serviceMethod:', name);
        return (...args) => this.service[name](args).promise();
    }

    resourceMethod(name) {
        return this.serviceMethod(`${name}${this.type}`);
    }

    Create() {
        return this.create().then(data => {
            this.physicalId = data[this.type].Id;
            return data[this.type];
        })
    }

    Update() {
        return this.Delete()
            .then(
                () => this.Create(),
                () => this.Create()
            )
    }

    Delete() {
        // succeed fast if resource does not exist
        return (this.resourceMethod('read') ? this.read().then(() => this.delete()) : this.delete())
            .catch(err => [err.constructor.name, err.code].includes("NotFoundException") || Promise.reject(err));
    }
};