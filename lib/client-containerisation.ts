import { aws_ecr as ecr, aws_certificatemanager as cm, aws_ec2 as ec2, aws_ecs as ecs, aws_elasticloadbalancingv2 as elbv2, aws_iam as role, Duration, StackProps  } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ClientECSContainer extends cdk.Stack {
    public sg: ec2.SecurityGroup;
    constructor(scope: Construct, id: string, repository: ecr.Repository, vpc: ec2.Vpc, props?: StackProps) {
        super(scope, id, props);

        const taskRole = new role.Role(this, 'taskRole', {
            assumedBy: new role.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });

        taskRole.addToPolicy(new role.PolicyStatement({
            resources: ['*'],
            actions: ['*']
        }));

        const taskDefinition = new ecs.FargateTaskDefinition(this, 'Clientbackend-fargattaskdefinition', {
            memoryLimitMiB: 1024,
            taskRole: taskRole,
        });
        const container = taskDefinition.addContainer('ClientBackendContainer', {
            image: ecs.EcrImage.fromEcrRepository(repository),
            logging: ecs.LogDriver.awsLogs({ streamPrefix: 'clientbackend'  })
        });
        container.addPortMappings({
            containerPort: 8080,
        });

        const cluster = new ecs.Cluster(this, 'ClientBackendCluster', {
            vpc: vpc,
        });


        const service = new ecs.FargateService(this, 'Clientbackend-service', {
            cluster,
            taskDefinition,
            assignPublicIp: true,
        });
        const lb = new elbv2.ApplicationLoadBalancer(this, 'Clientbackend-applicationloadbalancer', {
            vpc: vpc,
            internetFacing: true,
        });

        lb.addRedirect();

        const certificate = cm.Certificate.fromCertificateArn(
            this, '443 Certificate',
            'arn:aws:acm:eu-west-1:619680812856:certificate/5c518fb2-306e-4d58-bca7-e90c991429c8'
        );
        const listener = lb.addListener('Clientbackend-listener', {
            open: true,
            port: 443,
            certificates: [certificate],
        });


        listener.addTargets('Clientbackend-targetgroup', {
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targets: [service],
            healthCheck: {
                path: '/health',
                interval: cdk.Duration.minutes(1),
                timeout: Duration.seconds(30),
                unhealthyThresholdCount: 10,
            },
        });

        this.sg = new ec2.SecurityGroup(this, 'rds-security-group', {
            vpc,
            allowAllOutbound: true,
        });

        this.sg.connections.allowFrom(service, ec2.Port.allTcp(), 'cluster access');
        this.sg.addIngressRule(ec2.Peer.ipv4(vpc.isolatedSubnets[0].ipv4CidrBlock), ec2.Port.allTcp(), 'Lambda');
    }
}