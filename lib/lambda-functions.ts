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

    this.createSignedUrl.addFunctionUrl({
      authType: lambdaBasic.FunctionUrlAuthType.NONE,
      cors: {
        allowedHeaders: ["*"],
        allowedOrigins: [prefix === 'dev' ? "https://dev-solicitor.helpmycase.co.uk" : "https://solicitor.helpmycase.co.uk"],
        allowedMethods: [lambdaBasic.HttpMethod.POST],
      }
    })

    this.createSignedUrl.addPermission("lambda-functionUrl-Invoke", {
      principal: principal ,
      action: "lambda:invokeFunctionUrl",
    })
    imageUploadBucket.grantPut(this.createSignedUrl );
  }
}