import * as sqs from "@aws-cdk/aws-sqs";
import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as cloudwatch from "@aws-cdk/aws-cloudwatch";
import { Alarm, TreatMissingData } from "@aws-cdk/aws-cloudwatch";

export class DockerEcsSqsAutoScalingStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const messageQueue = new sqs.Queue(this, "DockerEcsSqsAutoScalingQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });


    const credentialsRole = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });

    credentialsRole.attachInlinePolicy(
      new iam.Policy(this, "SendMessagePolicy", {
        statements: [
          new iam.PolicyStatement({
            actions: ["sqs:SendMessage"],
            effect: iam.Effect.ALLOW,
            resources: [messageQueue.queueArn],
          }),
        ],
      })
    );

    const api = new apigateway.RestApi(this, "Endpoint", {
      deployOptions: {
        stageName: "run",
        tracingEnabled: true,
      },
    });

    const queue = api.root.addResource("queue");
    queue.addMethod(
      "GET",
      new apigateway.AwsIntegration({
        service: "sqs",
        path: `${cdk.Aws.ACCOUNT_ID}/${messageQueue.queueName}`,
        integrationHttpMethod: "POST",
        options: {
          credentialsRole,
          passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
          requestParameters: {
            "integration.request.header.Content-Type": `'application/x-www-form-urlencoded'`,
          },
          requestTemplates: {
            "application/json": `Action=SendMessage&MessageBody=$util.urlEncode("$method.request.querystring.message")`,
          },
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: {
                "application/json": `{"done": true}`,
              },
            },
          ],
        },
      }),
      { methodResponses: [{ statusCode: "200" }] }
    );

    const natGatewayProvider = ec2.NatProvider.instance({
      instanceType: new ec2.InstanceType("t3.nano"),
    });

    const vpc = new ec2.Vpc(this, "FargateVPC", {
      natGatewayProvider,
      natGateways: 1,
    });

    const cluster = new ecs.Cluster(this, "Cluster", { vpc });

    // Create task definition
    const fargateTaskDefinition = new ecs.FargateTaskDefinition(
      this,
      "FargateTaskDef",
      {
        memoryLimitMiB: 4096,
        cpu: 2048,
      }
    );

    // create a task definition with CloudWatch Logs
    const logging = new ecs.AwsLogDriver({
      streamPrefix: "myapp",
    });

    // Create container from local `Dockerfile`
    const appContainer = fargateTaskDefinition.addContainer("Container", {
      image: ecs.ContainerImage.fromAsset("./python-app", {}),
      logging,
    });

    // Create service
    const service = new ecs.FargateService(this, "Service", {
      cluster,
      taskDefinition: fargateTaskDefinition,
      desiredCount: 0,
    });

    // Configure task auto-scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: 0,
      maxCapacity: 1,
    });

    // Setup scaling metric and cooldown period
    scaling.scaleOnMetric("QueueMessagesVisibleScaling", {
      metric: messageQueue.metricApproximateNumberOfMessagesVisible(),
      adjustmentType: autoscaling.AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: cdk.Duration.seconds(300),
      scalingSteps: [
        { upper: 0, change: -1 },
        { lower: 1, change: +1 },
      ],
    });
  }
}
