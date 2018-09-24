'use strict';
const response = require('cfn-response');
const _ = require('underscore');

module.exports = class CustomResource {

    constructor(req, context) {
        this.req = req;
        this.context = context;
        this.props = _.omit(req.ResourceProperties, 'ServiceToken');
        this.physicalId = req.PhysicalResourceId;
    }

    Name() {
        const {StackId, LogicalResourceId, RequestId} = this.req;
        return `${StackId.split('/')[1].slice(-13)}-${LogicalResourceId.substr(0,13)}-${RequestId.slice(-12)}`;
    }

    static create(req, context) {
        const type = req.ResourceType.split('::')[1];
        const Cls = require(`./${type.replace(/-/g, '/')}.js`);
        return new Cls(req, context);
    }

    static request(req, context, callback) {
        const respond = (status, data) => {
            response.send(req, status, data, data.Id, callback);
        };

        const failed = err => {
            console.error(err);
            if (err !== "DELAYED") respond(response.FAILED, {Id: req.PhysicalResourceId});
        };

        try {
            console.log(JSON.stringify(req));
            const resource = CustomResource.create(req, context);

            const success = data => {
                console.log(JSON.stringify(data));
                respond(response.SUCCESS, Object.assign(data, {Id: resource.physicalId}));
            };

            resource[req.RequestType]().then(success, failed);
        } catch(err) {
            failed(err);
        }
    }
};