import { aws_ec2 as ec2, aws_rds as rds } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DashboardDatabase extends cdk.Stack {
    constructor(scope: Construct, id: string, vpc: ec2.Vpc, sg: ec2.SecurityGroup, props?: cdk.StackProps) {
        super(scope, id, props);

        const instance = new rds.DatabaseInstance(this, 'Instance', {
            engine: rds.DatabaseInstanceEngine.mysql({
                version: rds.MysqlEngineVersion.VER_8_0_25,
            }),
            // optional, defaults to m5.large
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL) ,
            credentials: rds.Credentials.fromGeneratedSecret('syscdk'), // Optional - will default to 'admin' username and generated password
            vpc: vpc ,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            },
            databaseName: 'main',
        });

        instance.addProxy(id + '-dashboard-proxy', {
            secrets: instance.secret ? [instance.secret] : [],
            vpc: vpc ,
            securityGroups: [sg ],
            requireTLS: false,
        });
    }
}