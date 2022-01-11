import * as ecr from '@aws-cdk/aws-ecr';
import * as cdk from '@aws-cdk/core';

export class DashboardRegistry extends cdk.Stack {
    public repository: ecr.Repository;
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.repository = new ecr.Repository(this, 'DashboardBackend');
    }
}