import * as cdk from '@aws-cdk/core';
import * as ca from '@aws-cdk/aws-codeartifact';

export class BackendCodeArtifact extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
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