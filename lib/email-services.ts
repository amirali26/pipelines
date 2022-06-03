import { aws_lambda_nodejs as lambda, aws_sqs as sqs, aws_iam as iam, aws_lambda_event_sources as les } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class EmailService extends cdk.Stack {
  
constructor(
    scope: Construct,
    id: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'EmailServiceQueue', {
        fifo: true,
    });

    const emailLambda = new lambda.NodejsFunction(this, 'EmailService', {
      entry: 'lambda/EmailService/index.ts',
      bundling: {
        minify: true,
      },
    });

    emailLambda.addEventSource(new les.SqsEventSource(queue));
    
    const policy = new iam.PolicyStatement({
        actions: ['ses:SendTemplatedEmail'],
        resources: ['*'],
    });

    emailLambda.addToRolePolicy(policy);
  }
}