import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';

export class DashboardDatabase extends cdk.NestedStack {
    constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, sg: ec2.SecurityGroup, props?: cdk.NestedStackProps) {
        super(scope, id, props);

        const instance = new rds.DatabaseInstance(this, 'Instance', {
            engine: rds.DatabaseInstanceEngine.mysql({
                version: rds.MysqlEngineVersion.VER_8_0_25,
            }),
            // optional, defaults to m5.large
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL) as any,
            credentials: rds.Credentials.fromGeneratedSecret('syscdk'), // Optional - will default to 'admin' username and generated password
            vpc: vpc as any,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            },
            securityGroups: [sg as any]
        });
    }
}