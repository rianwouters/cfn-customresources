'use strict';
const response = require('cfn-response');
const _ = require('underscore');

module.exports = class CustomResource {

    constructor(req) {
        this.stackId = req.StackId;
        this.logicalId = req.LogicalResourceId;
        this.reqId = req.requestId;
        this.props = _.omit(req.ResourceProperties, 'ServiceToken');
        this.physicalId = req.PhysicalResourceId;
    }

    Name() {
        return `${this.stackId.split('/')[1].slice(-13)}-${this.logicalId.substr(0,13)}-${this.reqId.slice(-12)}`;
    }

    static create(req) {
        const type = req.ResourceType.split('::')[1];
        const Cls = require(`./${type.replace(/-/g, '/')}.js`);
        return new Cls(req);
    }

    static request(req, context, callback) {
        try {
            console.log(JSON.stringify(req));
            const resource = CustomResource.create(req);

            const respond = (status, data) => {
                response.send(req, status, Object.assign(data, {Id: resource.physicalId}), resource.physicalId, callback);
            };

            const failed = err => {
                console.error(err);
                respond(response.FAILED, {});
            };

            const success = data => {
                console.log(JSON.stringify(data));
                respond(response.SUCCESS, data);
            };

            resource[req.RequestType]().then(success, failed);
        } catch(err) {
            failed(err);
        }
    }
};