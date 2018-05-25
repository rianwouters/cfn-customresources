'use strict';
const response = require('cfn-response');

module.exports = class CustomResource {
    constructor() {
    }

    Name(req) {
        return `${req.StackId.split('/')[1].slice(-13)}-${req.LogicalResourceId.slice(-13)}-${req.RequestId.slice(-12)}`;
    }

    static create(type) {
        const [brand, service, resource] = type.split('-');
        // TODO: move into brand/service/resource.js dir
        const Cls = require(`./${service}${resource}.js`);
        return new Cls(service, resource);
    }

    static type(req) {
        return  req.ResourceType.split('::')[1];
    }

    static request(req, context, callback) {
        const failed = err => {
            console.error(err);
            respond(response.FAILED, {});
        };

        const success = data => {
            console.log(JSON.stringify(data));
            respond(response.SUCCESS, data);
        };

        const respond = (status, data) => {
            response.send(req, context, status, data, req.PhysicalResourceId);
            callback(null);
        };

        try {
            console.log(JSON.stringify(req));
            const resource = CustomResource.create(CustomResource.type(req));
            resource[req.RequestType](req).then(success, failed);
        } catch(err) {
            failed(err);
        }
    }
};