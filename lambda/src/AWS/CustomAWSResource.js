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

    get type() {
        return this.constructor.name;
    }

    serviceMethod(name) {
        const methodName = `${name}${this.type}`;
        console.log('serviceMethod:', methodName);
        if (this.service[methodName]) {
            const paramMethodName = `${name}Params`;
            return () => {
                const params = this[paramMethodName]();
                return this.service[methodName](params).promise();
            }
        }
    }

    createParams() {
        return this.props;
    }

    readParams() {
        return this.deleteParams();
    }

    deleteParams() {
        return {Id: this.physicalId};
    }


    serviceCreate() {
        const createMethod = this.serviceMethod('create');
        return createMethod();
    }

    Create() {
        return this.serviceCreate().then(data => {
            const res = this.response(data);
            this.physicalId = res.Id;
            return res;
        })
    }

    Update() {
        return this.Delete()
            .then(
                () => this.Create(),
                () => this.Create()
            )
            .catch(err => Promise.reject(err));
    }

    Delete() {
        const del = this.serviceMethod('delete');
        const read = this.serviceMethod('read');

        // succeed fast if resource does not exist
        return (read ? read().then(() => del()) : del()).catch(
            err => [err.constructor.name, err.code].includes("NotFoundException") || Promise.reject(err)
        );
    }

    response(data) {
        return data[this.type];
    }
};