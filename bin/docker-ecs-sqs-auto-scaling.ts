#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { DockerEcsSqsAutoScalingStack } from '../lib/docker-ecs-sqs-auto-scaling-stack';


const envEU  = { account: '629373475343', region: 'eu-central-1' };
const app = new cdk.App();
new DockerEcsSqsAutoScalingStack(app, 'DockerEcsSqsAutoScalingStack'
, {env: envEU}
);