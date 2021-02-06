#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { DockerEcsSqsAutoScalingStack } from '../lib/docker-ecs-sqs-auto-scaling-stack';

const app = new cdk.App();
new DockerEcsSqsAutoScalingStack(app, 'DockerEcsSqsAutoScalingStack');