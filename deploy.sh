#!/bin/bash
ssh -i "./server-certs/test-mumbai.pem" -t ec2-user@ec2-13-127-149-74.ap-south-1.compute.amazonaws.com "cd inlo/inlo-cloud/WebInlo; git pull; ./install.sh"
echo "------------------------------------DEPLOYED--------------------------------"
echo "Test it out at- https://api.theinlo.com/home/register.html"
echo "----------------------------------------------------------------------------"
