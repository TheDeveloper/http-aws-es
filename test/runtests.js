var archiver, AWS, s3, cloudformation, lambda;
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

var templateData = fs.readFileSync(path.join(__dirname, 'cloudformation-template'), {encoding: 'utf8'});
var codeZipFileName = 'package.zip';
var s3Key = 'package.zip';

var options = require('minimist')(process.argv.slice(2));
var stackName = options.stackname || 'http-aws-es-test';

function checkArgs() {
    if (!process.env.AWS_REGION) {
        console.error("Error: Set the AWS_REGION environment variable before running this script");
        process.exit(1);
    }
    if (!options.keypair) {
        console.error("Error: Specify the name of an AWS SSH key pair on the command line with --keypair=\"key pair name\"");
        process.exit(1);
    }
    if (!options.bucket) {
        console.error("Error: Specify the name of an S3 bucket on the command line with --bucket=\"bucket name\"");
        process.exit(1);
    }
}

function compile() {
    console.log("Compiling http-aws-es");
    child_process.spawnSync('npm', ['run', 'prepublish'], {cwd: path.join(__dirname, '..'), stdio: ['inherit', 'inherit', 'inherit']});
}

function deps() {
    console.log("Installing test dependencies");
    child_process.spawnSync('npm', ['install'], {cwd: __dirname, stdio: ['inherit', 'inherit', 'inherit']});
}

function build(callback) {
    console.log("Building zip file");
    var archive = archiver.create('zip', {});
    var zipStream = fs.createWriteStream(path.join(__dirname, codeZipFileName));
    zipStream.on('close', callback);
    archive.pipe(zipStream);
    archive.append(fs.createReadStream(path.join(__dirname, 'lambda.js')), {name: 'lambda.js'});
    archive.append(fs.createReadStream(path.join(__dirname, 'ec2.js')), {name: 'ec2.js'});
    archive.directory(path.join(__dirname, 'node_modules'), 'node_modules', {});
    archive.finalize();
}

function uploadCode(callback) {
    console.log("Uploading zip file to S3");
    s3.upload({
        Bucket: options.bucket,
        Key: s3Key,
        Body: fs.createReadStream(path.join(__dirname, codeZipFileName))
    }, function(err, data) {
        if (err) {
            console.error(err);
            process.exitCode = 1;
            return;
        }
        callback();
    });
}

function createOrUpdateStack(callback) {
    var parameters = [
        {
            ParameterKey: "KeyName",
            ParameterValue: options.keypair
        },
        {
            ParameterKey: "CodeZipS3Bucket",
            ParameterValue: options.bucket
        },
        {
            ParameterKey: "CodeZipS3Key",
            ParameterValue: s3Key
        }
    ];

    console.log("Note: AWS resources will now be allocated. Don't forget " +
                "to delete the Cloudformation stack when you are done to " +
                "avoid unwanted charges");
    cloudformation.describeStacks({
        StackName: stackName
    }, function(err, data) {
        if (err && err.message == "Stack with id " + stackName + " does not exist") {
            console.log("Creating Cloudformation stack");
            cloudformation.createStack({
                StackName: stackName,
                Capabilities: [
                    'CAPABILITY_IAM'
                ],
                TemplateBody: templateData,
                Parameters: parameters
            }, function(err, data) {
                if (err) {
                    console.error(err);
                    process.exitCode = 1;
                    return;
                }
                var stackId = data.StackId;
                console.log("Waiting for stack creation to complete");
                cloudformation.waitFor('stackCreateComplete', {
                    StackName: stackId
                }, function(err, data) {
                    if (err) {
                        console.error(err);
                        process.exitCode = 1;
                        return;
                    }
                    callback(data.Stacks[0].Outputs);
                });
            });
        } else if (err) {
            console.error(err);
            process.exitCode = 1;
            return;
        } else {
            console.log("Updating Cloudformation stack");
            cloudformation.updateStack({
                StackName: stackName,
                Capabilities: [
                    'CAPABILITY_IAM'
                ],
                TemplateBody: templateData,
                Parameters: parameters
            }, function(err, data) {
                if (err) {
                    console.error(err);
                    process.exitCode = 1;
                    return;
                }
                var stackId = data.StackId;
                console.log("Waiting for stack update to complete");
                cloudformation.waitFor('stackUpdateComplete', {
                    StackName: stackId
                }, function(err, data) {
                    if (err) {
                        console.error(err);
                        process.exitCode = 1;
                        return;
                    }
                    callback(data.Stacks[0].Outputs);
                });
            });
        }
    });
}

function invokeLambda(functionName, esEndpoint) {
    console.log("Invoking Lambda function");
    lambda.invoke({
        FunctionName: functionName,
        Payload: JSON.stringify({endpoint: esEndpoint})
    }, function(err, data) {
        if (err) {
            console.error(err);
            process.exitCode = 1;
            return;
        }
        console.log("Lambda result: " + data.Payload);
    });
}

function main() {
    checkArgs();
    compile();
    deps();
    archiver = require(__dirname+'/node_modules/archiver');
    AWS = require(__dirname+'/node_modules/aws-sdk');
    s3 = new AWS.S3();
    cloudformation = new AWS.CloudFormation();
    lambda = new AWS.Lambda();
    build(function() {
        uploadCode(function() {
            createOrUpdateStack(function(outputs) {
                var sshIndex = null;
                var lambdaIndex = null;
                var endpointIndex = null;
                for (var i = 0; i < outputs.length; i++) {
                    if (outputs[i].OutputKey == "SSHCommand") {
                        sshIndex = i;
                    } else if (outputs[i].OutputKey == "LambdaFunctionName") {
                        lambdaIndex = i;
                    } else if (outputs[i].OutputKey == "ElasticsearchEndpoint") {
                        endpointIndex = i;
                    }
                }
                var sshCommand = outputs[sshIndex].OutputValue;
                var lambdaFunctionName = outputs[lambdaIndex].OutputValue;
                var esEndpoint = outputs[endpointIndex].OutputValue;
                console.log("SSH command: " + sshCommand);
                invokeLambda(lambdaFunctionName, esEndpoint);
            });
        });
    });
}

main();
