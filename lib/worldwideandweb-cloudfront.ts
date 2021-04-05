import * as cm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import { AllowedMethods, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront';
import * as origin from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export class WorldWideAndWebStorybookCloudfront extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    s3Bucket: s3.Bucket,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const arn =
      'arn:aws:acm:us-east-1:460234074473:certificate/40df4d7e-f98e-4975-9181-4f20dddcc3b7';

    new cloudfront.Distribution(
      this,
      'Worldwideandweb Cloudfront Distribution',
      {
        domainNames: ['app.worldwideandweb.com'],
        certificate: cm.Certificate.fromCertificateArn(
          this,
          'WWW Certificate',
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
