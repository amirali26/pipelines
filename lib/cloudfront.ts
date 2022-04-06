import * as cm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import { AllowedMethods, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import * as origin from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export class Cloudfront extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    s3Bucket: s3.Bucket,
    domainNames: string[],
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const arn = 'arn:aws:acm:us-east-1:619680812856:certificate/2d184b4c-124c-4851-b7f5-c6559c78b53a';

    new cloudfront.Distribution(
      this,
      'Helpmycase Cloudfront Distribution',
      {
        domainNames,
        certificate: cm.Certificate.fromCertificateArn(this, 'Helpmycase Certificate', arn),
        defaultBehavior: {
          allowedMethods: AllowedMethods.ALLOW_ALL,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          origin: new origin.S3Origin(s3Bucket as any),
        },
      }
    );
  }
}
