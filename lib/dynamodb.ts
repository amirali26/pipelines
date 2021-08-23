import * as cm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

export class CertificateManager extends cdk.Stack {
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
      'helpmycase hosted zone',
      'Z1018955P0A0ARLVX9SO'
    );

      this.certificate = new cm.Certificate(this, 'Helpmycase-react-app', {
      domainName: 'solicitors.helpmycase.co.uk',
      validation: cm.CertificateValidation.fromDns(this.hostedZone),
    });
  }
}
