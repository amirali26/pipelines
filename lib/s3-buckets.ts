import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';


export class HandleMyCaseS3Stack extends cdk.Stack {
  public imageUploadBucket: s3.Bucket;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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