import * as ecr from '@aws-cdk/aws-ecr';
import * as cdk from '@aws-cdk/core';
import { DashboardECSContainer } from './dashboard-containerisation';

export class DashboardContainerisation extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const repository = new ecr.Repository(this, 'DashboardBackend');

        new DashboardECSContainer(this, 'HandleMyCaseEcsSetup', repository);
    }
}