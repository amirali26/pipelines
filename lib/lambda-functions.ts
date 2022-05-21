import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';

export class LambdaFunctions extends cdk.Stack {
  public createRequestLambda: lambda.NodejsFunction;
  public createSignedUrl: lambda.NodejsFunction;
  
  constructor(
    scope: cdk.Construct,
    id: string,
    imageUploadBucket: s3.Bucket,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    this.createRequestLambda = new lambda.NodejsFunction(this as any, 'CreateRequestFunction', {
      entry: 'lambda/CreateRequest/index.ts',
      bundling: {
        minify: true,
      },
    });
    
    this.createSignedUrl = new lambda.NodejsFunction(this as any, 'CreateSignedUrl', {
      entry: 'lambda/CreateSignedUrl/index.ts',
      bundling: {
        minify: true,
      },
      environment: {
        BUCKET_NAME: imageUploadBucket.bucketName,
      }
    });

    imageUploadBucket.grantPut(this.createSignedUrl as any);

    new cdk.CfnResource(this, 'FunctionUrl', {
      type: 'AWS::Lambda::Url',
      properties: {
        AuthType: 'NONE',
        Cors: {
          AllowCredentials: true,
          AllowMethods: ['GET', 'POST', 'PUT'],
          AllowOrigins: ['*'],
          AllowHeaders: ['*'],
        },
        TargetFunctionArn: this.createSignedUrl.functionArn,
      }
    })
  }
}