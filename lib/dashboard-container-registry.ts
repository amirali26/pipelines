import { aws_ecr as ecr } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ClientRegistry extends cdk.Stack {
    public repository: ecr.Repository;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.repository = new ecr.Repository(this, 'ClientBackend');
    }
}