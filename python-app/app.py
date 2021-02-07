import boto3

sqs = boto3.client('sqs')

queue_url = 'https://sqs.eu-central-1.amazonaws.com/629373475343/CdkDemoStack-CdkDemoQueue32E7553B-5GEYSDQGXR7Q'

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