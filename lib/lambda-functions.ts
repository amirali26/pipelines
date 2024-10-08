import { aws_lambda_nodejs as lambda, aws_s3 as s3, aws_lambda as lambdaBasic, aws_iam as iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class LambdaFunctions extends cdk.Stack {
  public createRequestLambda: lambda.NodejsFunction;
  public createSignedUrl: lambda.NodejsFunction;
  
  constructor(
    scope: Construct,
    id: string,
    prefix: string,
    imageUploadBucket: s3.Bucket,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    this.createRequestLambda = new lambda.NodejsFunction(this , 'CreateRequestFunction', {
      entry: 'lambda/CreateRequest/index.ts',
      bundling: {
        minify: true,
      },
    });

    const principal = new iam.AnyPrincipal();

    this.createSignedUrl = new lambda.NodejsFunction(this , 'CreateSignedUrl', {
      entry: 'lambda/CreateSignedUrl/index.ts',
      bundling: {
        minify: true,
      },
      environment: {
        BUCKET_NAME: imageUploadBucket.bucketName,
      },
    });

    const allowedOrigins = prefix === 'dev' ? ["https://dev-solicitor.helpmycase.co.uk", "http://localhost:3000"] : ["https://solicitor.helpmycase.co.uk"]
    this.createSignedUrl.addFunctionUrl({
      authType: lambdaBasic.FunctionUrlAuthType.NONE,
      cors: {
        allowedHeaders: ["*"],
        allowedOrigins: allowedOrigins,
        allowedMethods: [lambdaBasic.HttpMethod.POST],
      }
    });
    imageUploadBucket.grantPut(this.createSignedUrl);
  }
}