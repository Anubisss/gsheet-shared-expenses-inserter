#!/bin/bash

set -e

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: BUCKET_NAME environment variable is not set."
  exit 1
fi

YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CHECKMARK='✔'
RESET='\033[0m'

echo -e "${YELLOW}[1/3] Building...${RESET}"
npm run check-all
echo -e "${GREEN}[1/3] Building DONE ${CHECKMARK} ${RESET}\n"

echo -e "${YELLOW}[2/3] Removing all files from the S3 bucket...${RESET}"
aws s3 rm s3://$BUCKET_NAME/ --recursive
echo -e "${GREEN}[2/3] Removing DONE ${CHECKMARK} ${RESET}\n"

echo -e "${YELLOW}[3/3] Uploading files to the S3 bucket...${RESET}"
aws s3 sync dist/ s3://$BUCKET_NAME/ --delete
echo -e "${GREEN}[3/3] Uploading DONE ${CHECKMARK} ${RESET}\n"

echo -e "${GREEN}🎉🎉🎉 DEPLOYMENT COMPLETE! 🎉🎉🎉${RESET}"
