import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import * as sqs from '@aws-cdk/aws-sqs';
import * as iam from '@aws-cdk/aws-iam';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';

export class EmailService extends cdk.Stack {
  
constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'EmailServiceQueue', {
        fifo: true,
    });

    const emailLambda = new lambda.NodejsFunction(this as any, 'EmailService', {
      entry: 'lambda/EmailService/index.ts',
      bundling: {
        minify: true,
      },
    });

    emailLambda.addEventSource(new SqsEventSource(queue as any));
    
    const policy = new iam.PolicyStatement({
        actions: ['ses:SendTemplatedEmail'],
        resources: ['*'],
    });

    emailLambda.addToRolePolicy(policy as any);
  }
}