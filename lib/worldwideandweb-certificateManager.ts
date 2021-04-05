import * as cm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

export class WorldWideAndWebStorybookCertificateManager extends cdk.Stack {
  public hostedZone: route53.IHostedZone;
  public certificate: cm.ICertificate;
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    this.hostedZone = route53.HostedZone.fromHostedZoneId(
      this,
      'Worldwideandweb hosted zone',
      'Z03778471PHMCN6LLU526'
    );

      this.certificate = new cm.Certificate(this, 'Worldwideandweb-react-app', {
      domainName: 'app.worldwideandweb.com',
      validation: cm.CertificateValidation.fromDns(this.hostedZone),
    });
  }
}
