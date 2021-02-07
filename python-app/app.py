import boto3

sqs = boto3.client('sqs')

queue_url = 'https://sqs.eu-central-1.amazonaws.com/629373475343/DockerEcsSqsAutoScalingStack-DockerEcsSqsAutoScalingQueue2DAE4A36-5DMX2GTEINGG' # <-- Dont forget to change this to your SQS url

def read_sqs():
    print(f"We will try to read {queue_url}")
    response = sqs.receive_message(
        QueueUrl=queue_url,
        AttributeNames=[
            'SentTimestamp'
        ],
        MaxNumberOfMessages=1,
        MessageAttributeNames=[
            'All'
        ],
        VisibilityTimeout=0,
        WaitTimeSeconds=0
    )

    print(f"SQS responded with {response}")

    return response['Messages']

def delete_sqs_message(receipt_handle):
    print(f"Deleting message {receipt_handle}")
    # Delete received message from queue
    sqs.delete_message(
        QueueUrl=queue_url,
        ReceiptHandle=receipt_handle
    )

# Read SQS
messages = read_sqs()
print(f"Found messages {messages}")

for message in messages:
    # Take custom actions based on the message contents
    print(f"Activating {message}")
    print(f"Said Hello")

    # Delete Message 
    delete_sqs_message(message['ReceiptHandle'])
    print(f"Finished for {message}")