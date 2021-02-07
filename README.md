# 💸 Deploy low cost ECS tasks based on SQS queue size with AWS CDK

In this post we are building a system that scales up and down based on the amount of messages in the SQS queue. It allows users to do REST-API calls to an Amazon API Gateway endpoint from their applications or computers. This will add a new item to the SQS queue. In turn, this will trigger your task on ECS. After you're task is finished it will delete the item from the SQS queue which will automatically scale down you're ECS cluster and task. 

The complete post that contains all the information you need can be found on https://www.nbtl.blog/low-cost-automated-video-generation-with-sqs-and-ecs/

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
