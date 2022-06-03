import * as cdk from 'aws-cdk-lib';
import { aws_codeartifact as ca } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class BackendCodeArtifact extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

      const cfnDomain = new ca.CfnDomain(this, 'helpmycase-backend-domain', {
        domainName: 'helpmycase-backend',
      });

      const cfnRepository = new ca.CfnRepository(this, 'helpmycase-backend-repository', {
        domainName: cfnDomain.domainName,
        repositoryName: 'helpmycase-backend',
        upstreams: ['nuget-store']
      })
    }
}