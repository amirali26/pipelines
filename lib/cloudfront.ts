import { aws_certificatemanager as cm, aws_cloudfront as cf, aws_s3 as s3, aws_cloudfront_origins as origins  } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
export class Cloudfront extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    s3Bucket: s3.Bucket,
    domainNames: string[],
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const arn = 'arn:aws:acm:us-east-1:619680812856:certificate/2d184b4c-124c-4851-b7f5-c6559c78b53a';

    new cf.Distribution(
      this,
      'Helpmycase Cloudfront Distribution',
      {
        domainNames,
        certificate: cm.Certificate.fromCertificateArn(this, 'Helpmycase Certificate', arn),
        defaultBehavior: {
          allowedMethods: cf.AllowedMethods.ALLOW_ALL,
          viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          origin: new origins.S3Origin(s3Bucket),
        },
      }
    );
  }
}
