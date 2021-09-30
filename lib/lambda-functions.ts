import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';

export class LambdaFunctions extends cdk.Stack {
public createRequestLambda: lambda.NodejsFunction;
  
constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    this.createRequestLambda = new lambda.NodejsFunction(this as any, 'CreateRequestFunction', {
      entry: 'lambda/CreateRequest/index.ts',
      bundling: {
        minify: true,
      },
    });
  }
}