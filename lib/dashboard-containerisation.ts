import * as cm from '@aws-cdk/aws-certificatemanager';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as cdk from '@aws-cdk/core';
import * as role from '@aws-cdk/aws-iam';
import { Duration, NestedStackProps } from '@aws-cdk/core';

export class DashboardECSContainer extends cdk.NestedStack {
    constructor(scope: cdk.Construct, id: string, repository: ecr.Repository, vpc: ec2.Vpc, props?: NestedStackProps) {
        super(scope, id, props);

        const taskRole = new role.Role(this, 'taskRole', {
            assumedBy: new role.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });

        taskRole.addToPolicy(new role.PolicyStatement({
            resources: ['*'],
            actions: ['*']
        }));

        const taskDefinition = new ecs.FargateTaskDefinition(this, 'Dashboardbackend-fargattaskdefinition', {
            memoryLimitMiB: 1024,
            taskRole: taskRole as any,
        });
        const container = taskDefinition.addContainer('DashboardBackendContainer', {
            image: ecs.EcrImage.fromEcrRepository(repository as any),
        });
        container.addPortMappings({
            containerPort: 8080,
        });

        const cluster = new ecs.Cluster(this, 'DashboardBackendCluster', {
            vpc: vpc as any,
        });

        const service = new ecs.FargateService(this, 'Dashboardbackend-service', {
            cluster,
            taskDefinition,
            assignPublicIp: true,
        });
        const lb = new elbv2.ApplicationLoadBalancer(this, 'Dashboardbackend-applicationloadbalancer', {
            vpc: vpc,
            internetFacing: true,
        });

        lb.addRedirect();

        const certificate = cm.Certificate.fromCertificateArn(
            this, '443 Certificate',
            'arn:aws:acm:eu-west-1:460234074473:certificate/e425bca7-a5e5-48b7-8b5f-c8ed48356e45'
        );
        const listener = lb.addListener('Dashboardbackend-listener', {
            open: true,
            port: 443,
            certificates: [certificate],
        });


        listener.addTargets('Dashboardbackend-targetgroup', {
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [service as any],
            healthCheck: {
                path: '/health',
                interval: cdk.Duration.minutes(1) as any,
                timeout: Duration.seconds(30) as any,
                unhealthyThresholdCount: 10,
            }
        });
    }
}