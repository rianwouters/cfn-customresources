'use strict';
const CustomResource = require('../CustomResource.js');
const AWS = require('aws-sdk');

module.exports = class CustomAWSResource extends CustomResource {

    constructor(serviceName) {
        super();
        console.log("Creating", serviceName);
        console.log("type:", this.type);
        this.service = new AWS[serviceName]();
    }

    get type() {
        return this.constructor.name;
    }

    serviceMethod(name) {
        const methodName = `${name}${this.type}`;
        console.log('serviceMethod:', methodName);
        if (this.service[methodName]) {
            const paramMethodName = `${name}Params`;
            return req => {
                const params = this[paramMethodName](req);
                return this.service[methodName](params).promise();
            }
        }
    }

    createParams(req) {
        const params = req.ResourceProperties;
        delete params.ServiceToken;
        return params;
    }

    readParams(req) {
        return this.deleteParams(req);
    }

    deleteParams(req) {
        return {Id: req.PhysicalResourceId};
    }


    serviceCreate(req) {
        const createMethod = this.serviceMethod('create');
        return createMethod(req);
    }

    Create(req) {
        return this.serviceCreate(req).then(data => {
            const res = this.response(data);
            req.PhysicalResourceId = res.Id;
            return res;
        })
    }

    Update(req) {
        const id = req.PhysicalResourceId;
        return this.Delete(req)
            .then(
                () => (delete req.PhysicalResourceId, this.Create(req)),
                () => (delete req.PhysicalResourceId, this.Create(req))
            )
            .catch(err => (req.PhysicalResourceId = id, Promise.reject(err)));
    }

    Delete(req) {
        const del = this.serviceMethod('delete');
        const read = this.serviceMethod('read');

        // succeed fast if resource does not exist
        return (read ? read(req).then(() => del(req)) : del(req)).catch(
            err => [err.constructor.name, err.code].includes("NotFoundException") || Promise.reject(err)
        );
    }

    response(data) {
        return data[this.type];
    }
};