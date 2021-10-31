import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { LambdaFunctions } from './lambda-functions';

export class DynamoTables extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    createRequestLambda: NodejsFunction,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'table', {
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'accountId#status#createdDate',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    table.addLocalSecondaryIndex({
      indexName: 'userId-requestId',
      sortKey: {
        name: 'requestId#createdDate',
        type: dynamodb.AttributeType.STRING,
      }
    });

    table.addGlobalSecondaryIndex({
      indexName: 'accountId-userId',
      partitionKey: {
        name: 'accountId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'userId#status#createdDate',
        type: dynamodb.AttributeType.STRING,
      },
    });

    table.addGlobalSecondaryIndex({
      indexName: 'accountId-requestId',
      partitionKey: {
        name: 'accountId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'requestId#status#createdDate',
        type: dynamodb.AttributeType.STRING,
      }
    });

    table.addGlobalSecondaryIndex({
      indexName: 'requestId',
      partitionKey: {
        name: 'requestId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'status#createdDate',
        type: dynamodb.AttributeType.STRING,
      }
    });

    table.grantWriteData(createRequestLambda as any);

    const areasOfLaw = new dynamodb.Table(this, 'areasOfLawTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}