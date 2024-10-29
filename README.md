## Running Instructions
`to install dependencies`
1. npm install 

`to start queues`
2. docker compose up -d

`to run the Nest application`
3. npm start 

The queue the app will use is set by the environment variable `QUEUE_PROVIDER` which can take values of RABBITMQ or SQS

## How to use

<!-- ref: https://medium.com/@anchan.ashwithabg95/using-localstack-sns-and-sqs-for-devbox-testing-fa09de5e3bbb -->
> **Note**: This setup uses LocalStack for local AWS SQS testing. Make sure to have the [AWS CLI](https://aws.amazon.com/cli/) installed.

### SQS Setup

#### Creating a Queue
To create an SQS queue locally, run:
```bash
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name my-queue
```
#### Listing Queues
To view existing queues in your LocalStack instance:
```bash
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name my-queue
```

#### Getting Queue Attributes
To view existing queues in your LocalStack instance:
```bash
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
  --queue-url http://sqs.eu-central-1.localhost.localstack.cloud:4566/000000000000/my-queue \
  --attribute-name All
```
### RABBITMQ
RabbitMQ was straightforward to set up and use, requiring minimal configuration. Once the container was started, it was ready to go with default settings, making it efficient to integrate without additional setup steps.

#### Accessing the UI
Go to `http://localhost:15672/#/`
  username: guest
  password: guest

### API Endpoints
`POST => http://localhost:3000/queue/publish` to publish a message
  -  The message must be a JSON object in the body like this `{"message":"hello"}`

`POST => http://localhost:3000/queue/subscribe` to subscribe to a queue


## Considerations:
  - How can I use both queues at once?
     - This would likely include handling a new value of the environment variable QUEUE_PROVIDER=BOTH which would instantiate both queues. To use both of them the, /publish handler would randomly send the message to either of the queues and the /subscribe handler would need to subcribe to both queues, then the app should handle the messages as they come through.
  - How can I write the app to test it and have queues ready?
     - Use in-memory or mock versions of SQS and RabbitMQ during development and unit testing. This setup allows you to test message flow and handling without needing external dependencies.
     - Implement tests for error handling (e.g., invalid queue URLs or message content issues).
