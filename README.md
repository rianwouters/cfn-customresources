# cfn-customresources
Generic framework for creating AWS CloudFormation custom resources

This module contains an extensible framework for creating AWS CloudFormation custom resource handlers.
The included template.yml can be use to create a custom resource handler stack.
It outputs CustomResourceHandlerArn so that it can be used as a separate (nested) stack.

Currently supported resources types:
- Custom::AWS-ElasticTranscoder-Pipeline
- Custom::AWS-ElasticTranscoder-Preset
- Custom::AWS-APIGateway-Deployment
- Custom::AWS-APIGateway-ApiKey

Notes:
- unfortunately due to a limitation of CloudFormation, '::' cannot be used as a separator.
- Supported property names mostly resemble their AWS Javascript SDK counterparts to allow a one-to-one mapping

## Examples

### Custom::AWS-ElasticTranscoder-Pipeline

```
  Transcoder:
    Type: Custom::AWS-ElasticTranscoder-Pipeline
    Properties:
      ServiceToken: !GetAtt CustomResourceHandlerStack.Outputs.Arn
      InputBucket: !Ref InputBucket
      Role: !GetAtt ElasticTranscoderRole.Arn
      Notifications:
        Progressing: ''
        Completed: !Ref TranscodingCompletedSNSTopic
        Warning: ''
        Error: ''
      ContentConfig:
        Bucket: !Ref ContentBucket
        StorageClass: Standard
        Permissions:
        - Access:
          - Read
          Grantee: AuthenticatedUsers
          GranteeType: Group
      ThumbnailConfig:
        Bucket: !Ref ThumbnailBucket
        Permissions: []
```

### Custom::AWS-ElasticTranscoder-Preset

```
  Preset:
    Type: Custom::AWS-ElasticTranscoder-Preset
    Properties:
      ServiceToken: !GetAtt CustomResourceHandlerStack.Outputs.Arn
      Description: "My custom preset"
      Container: mp3
      Audio:
        Channels: '1'
        SampleRate: auto
        Codec: mp3
        BitRate: '64'
```

### Custom::AWS-APIGateway-Deployment

```
  Stage:
    Type: AWS::ApiGateway::Stage
    Properties:
      StageName: mystage
      DeploymentId: !Ref Deployment
      RestApiId: !Ref MyAPI
  Deployment:
    Type: Custom::AWS-APIGateway-Deployment
    Properties:
      ServiceToken: !GetAtt CustomResourceHandlerStack.Outputs.Arn
      description: version ${env:CODEBUILD_RESOLVED_SOURCE_VERSION}
      restApiId: !Ref MyAPI
```

Notes: 
The resource has to change to trigger a custom resource request. Therefore the description has to change whenever a new version needs to be deployed.
In this example this has been done by using the commit SHA from AWS CodeBuild.
The env construct is modelled according to the syntax defined by serverless.com.
The following ugly preprocessing script replaces environment variables by their value:

```
# replace environment variables based on the syntax defined by serverless.com, i.e. ${env: VARIABLE_NAME}
sed -e 's/\(.*\)${[[:space:]]*env:[[:space:]]*\([[:graph:]]\+\)[[:space:]]*}/echo "\1$\2"/eg'
```

It needs to be excuted before packaging and executing the template.
This makes the deployment nicely appear in the AWS API Gateway console with description 'version <git commit SHA>'

### Custom::AWS-APIGateway-ApiKey

```
  APIKey:
    Type: Custom::AWS-APIGateway-ApiKey
    Properties:
      ServiceToken: !GetAtt CustomResourceHandler.Arn
      enabled: true
      value: 'valueabcdefghijklmnopqrstuvwxyz123456789'
      stageKeys:
        - restApiId: !Ref MyAPI
          stageName: mystage
```

## Extensibility

CloudFormation calls CustomResource.request to create/update/delete a resource.
It acts as a factory method that creates a CustomResource instance based on the resource type.
It does this by removing the 'Custom::' prefix, and splitting the type into [brand, service, resource] based on the '-' separator.
urrently this is mapped on the ${service}${resource} class. In the future it will be mapped on the directory structure.
The cfn-response module is used to send responses to the CloudFormation request.
Implementations of a resource type are currently based on 3 base classes.

### CustomResource
The most basic representation of a resource.

Depending on the custom resource request type, its ```Create/Delete/Update``` methods are called with the request as a parameter. 

### CustomAWSResource
A custom resource implementation that maps a resource type on the AWS[Service].[<create|delete|read>Resource] methods of the AWS Javascript SDK.
* Its ```<create|delete|read>Params``` methods are called to create the SDK method parameters, whose default implementations map the resource properties to the most common SDK parameter patterns.
* Its response method is called to map the data returned from the SDK method, to CloudFormation attributes. It needs to contains at least the Id property containing the resource Id. Note that this is not implemented consistently in the SDK.

As an example, the APIGatewayDeployment class uses this base class with custom delete parameters.

Updating a resource is implemented by first trying to delete the current resource. In any case a new resource is created.
 
### CustomUpdatableAWSResource
A CustomAWSResource that updates a resource by using the update<Resource> method of the associated SDK service.

## TODOs
- move classes into a package directory hierarchy (AWS/ElasticTranscoder/Pipeline, etc.)


