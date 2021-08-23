import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as cdk from '@aws-cdk/core';

export class DynamoTables extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const userPermissions = new dynamodb.Table(this, 'userPermissions', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const userProfiles = new dynamodb.Table(this, 'userProfiles', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'accountId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const accountPermissions = new dynamodb.Table(this, 'accountPermissions', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    const accountProfiles = new dynamodb.Table(this, 'accountProfiles', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const requestSubmission = new dynamodb.Table(this, 'requestSubmissions', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'createdDate',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    requestSubmission.addLocalSecondaryIndex({
      indexName: 'accountId',
      sortKey: {
        name: 'accountId',
        type: dynamodb.AttributeType.STRING
      },
    });

    const requestAccountTable = new dynamodb.Table(this, 'requestAccountTable', {
      partitionKey: {
        name: 'requestId#userId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'accountId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}
