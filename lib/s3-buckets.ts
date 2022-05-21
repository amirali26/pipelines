
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export class HandleMyCaseS3Stack extends cdk.Stack {
  public imageUploadBucket: s3.Bucket;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const corsRuleLocal: s3.CorsRule = {
      allowedMethods: [s3.HttpMethods.POST, s3.HttpMethods.PUT, s3.HttpMethods.GET],
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
    }
    this.imageUploadBucket = new s3.Bucket(this, 'helpmycase-image-upload-bucket', {
      publicReadAccess: true,
      cors: [corsRuleLocal],
    });
  }
}