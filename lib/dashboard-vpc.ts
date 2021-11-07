import * as ecr from '@aws-cdk/aws-ecr';
import * as cdk from '@aws-cdk/core';
import { DashboardECSContainer } from './dashboard-containerisation';
import { DashboardDatabase } from './dashboard-database';
import * as ec2 from '@aws-cdk/aws-ec2';

export class DashboardVPC extends cdk.Stack {
    public vpc: ec2.Vpc;
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, 'Dashboardbackend-vpc', {
            natGateways: 0,
            subnetConfiguration: [{
                name: 'public-subnet',
                subnetType: ec2.SubnetType.PUBLIC,
            }, {
                name: 'private-subnet',
                subnetType: ec2.SubnetType.ISOLATED,
            }],
            maxAzs: 2,
            cidr: '10.1.0.128/26',
        });
    }
}