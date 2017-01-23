= Running Tests

The scripts in this directory test http-aws-es on live AWS resources using a Cloudformation stack and a driver script. When you run the tests, the module will be compiled, packaged into a zip file with the test scripts, and uploaded to a S3 bucket. Then, a Cloudformation stack is created, with an Elasticsearch domain, an EC2 instance, a Lambda function, and ancillary IAM resources. Once the stack is ready, the lambda function will be called, and the result will be displayed. The EC2 instance automatically runs its test when it starts up, and the driver script will print out an SSH command that, when run, will print out the results of that test.

Please note that the driver script does not tear down the Cloudformation stack after running the tests. You will have to delete the stack from the console or CLI yourself when you are done with it. Similarly, if you want to delete the S3 bucket used to hold the code package, you will have to do this manually.

== Prerequisites

- You must set the AWS\_ACCESS\_KEY\_ID and AWS\_SECRET\_ACCESS\_KEY environment variables to use the AWS API. Your IAM user must have permissions for IAM, EC2, S3, Lambda, Elasticsearch, and Cloudformation.
- Pick an AWS region in which to run the tests.
- Create an S3 bucket in the correct region, and ensure your IAM user can upload to it.
- Create or import an EC2 key pair in the correct region.
- Run `npm install` from inside the `test` directory to install the needed libraries in `test/node_modules`.

== Command line

The `runtests.js` script takes the SSH key pair name and S3 bucket name as command line arguments. Additionally, if you have not set it yet, you will need to set the AWS\_REGION environment variable for the AWS SDK to use. The syntax is as follows.

```
AWS_REGION=us-west-2 node runtests.js --keypair="Desktop SSH key" --bucket="my-http-aws-es-test-bucket"
```

== Example output

```
david@desktop:~/http-aws-es/test$ AWS_REGION=us-west-2 node runtests.js --keypair="Desktop SSH key" --bucket="divergentdave-http-aws-es-test"
Compiling http-aws-es

> http-aws-es@1.1.3 prepublish /home/david/http-aws-es
> babel ./connector-es6.js > ./connector.js

Installing test dependencies
npm WARN package.json http-aws-es-test@1.0.0 No repository field.
npm WARN package.json http-aws-es-test@1.0.0 No license field.
Building zip file
Uploading zip file to S3
Note: AWS resources will now be allocated. Don't forget to delete the Cloudformation stack when you are done to avoid unwanted charges
Creating Cloudformation stack
Waiting for stack creation to complete
SSH command: ssh ec2-user@ec2-52-38-188-74.us-west-2.compute.amazonaws.com cat log.txt
Invoking Lambda function
Lambda result: "success"
david@desktop:~/http-aws-es/test$ ssh ec2-user@ec2-52-38-188-74.us-west-2.compute.amazonaws.com cat log.txt
The authenticity of host 'ec2-52-38-188-74.us-west-2.compute.amazonaws.com (52.38.188.74)' can't be established.
ECDSA key fingerprint is df:f2:5f:6d:8a:30:ab:fe:f0:5e:ea:fc:4b:a4:2b:84.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'ec2-52-38-188-74.us-west-2.compute.amazonaws.com,52.38.188.74' (ECDSA) to the list of known hosts.
Successfully authenticated to the AWS Elasticsearch domain
```
