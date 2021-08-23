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
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const arn =
      'arn:aws:acm:us-east-1:460234074473:certificate/06f87d32-b4c3-41d4-90a8-46b07d2bfc0f';

    new cloudfront.Distribution(
      this,
      'Helpmycase Cloudfront Distribution',
      {
        domainNames: ['solicitors.helpmycase.co.uk'],
        certificate: cm.Certificate.fromCertificateArn(
          this,
          'Helpmycase Certificate',
          arn
        ),
        defaultBehavior: {
          allowedMethods: AllowedMethods.ALLOW_ALL,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          //@ts-ignore
          origin: new origin.S3Origin(s3Bucket),
        },
      }
    );
  }
}
