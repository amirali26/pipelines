import * as ecr from '@aws-cdk/aws-ecr';
import * as cdk from '@aws-cdk/core';
import { DashboardECSContainer } from './dashboard-containerisation';
import { DashboardDatabase } from './dashboard-database';
import * as ec2 from '@aws-cdk/aws-ec2';

export class DashboardContainerisation extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const repository = new ecr.Repository(this, 'DashboardBackend');

        const vpc = new ec2.Vpc(this, 'Dashboardbackend-vpc', {
            natGateways: 0,
            subnetConfiguration: [{
                name: 'public-subnet',
                subnetType: ec2.SubnetType.PUBLIC,
            }],
            maxAzs: 2,
            cidr: '10.1.0.128/27',
        });

        const sg = new ec2.SecurityGroup(this, 'rds-security-group', {
            vpc,
            allowAllOutbound: true,
        });

        new DashboardECSContainer(this, 'HandleMyCaseEcsSetup', repository, vpc, sg);
        new DashboardDatabase(this, 'HandleMyCaseDashboardSetup', vpc, sg);
    }
}