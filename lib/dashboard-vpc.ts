import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
export class DashboardVPC extends cdk.Stack {
    public vpc: ec2.Vpc;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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