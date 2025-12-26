#!/bin/bash
# MinIO Bucket Initialization Script
# This script creates and configures the required bucket in MinIO for local development

set -e

# Configuration
MINIO_HOST="${MINIO_HOST:-localhost:9000}"
MINIO_USER="${MINIO_USER:-minioadmin}"
MINIO_PASSWORD="${MINIO_PASSWORD:-minioadmin}"
BUCKET_NAME="${BUCKET_NAME:-local-assets}"
MINIO_ALIAS="local"

echo "========================================="
echo "MinIO Bucket Initialization"
echo "========================================="
echo ""
echo "Host: $MINIO_HOST"
echo "Bucket: $BUCKET_NAME"
echo ""

# Check if mc (MinIO Client) is installed
if ! command -v mc &> /dev/null; then
    echo "Error: MinIO Client (mc) is not installed"
    echo ""
    echo "Installation instructions:"
    echo "  Linux:   wget https://dl.min.io/client/mc/release/linux-amd64/mc && chmod +x mc && sudo mv mc /usr/local/bin/"
    echo "  macOS:   brew install minio/stable/mc"
    echo "  Windows: Download from https://dl.min.io/client/mc/release/windows-amd64/mc.exe"
    echo ""
    exit 1
fi

echo "✓ MinIO Client (mc) is installed"
echo ""

# Set alias for MinIO instance
echo "Configuring MinIO alias '$MINIO_ALIAS'..."
mc alias set "$MINIO_ALIAS" "http://$MINIO_HOST" "$MINIO_USER" "$MINIO_PASSWORD" &> /dev/null

if [ $? -eq 0 ]; then
    echo "✓ MinIO alias configured successfully"
else
    echo "✗ Failed to configure MinIO alias"
    echo "  Make sure MinIO is running: docker-compose up -d minio"
    exit 1
fi
echo ""

# Check if bucket exists
echo "Checking if bucket '$BUCKET_NAME' exists..."
if mc ls "$MINIO_ALIAS/$BUCKET_NAME" &> /dev/null; then
    echo "✓ Bucket '$BUCKET_NAME' already exists"
else
    echo "Creating bucket '$BUCKET_NAME'..."
    mc mb "$MINIO_ALIAS/$BUCKET_NAME"

    if [ $? -eq 0 ]; then
        echo "✓ Bucket '$BUCKET_NAME' created successfully"
    else
        echo "✗ Failed to create bucket"
        exit 1
    fi
fi
echo ""

# Set public read policy for assets (development only)
echo "Setting public read policy for assets..."
cat > /tmp/minio-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::${BUCKET_NAME}/*"
      ]
    }
  ]
}
EOF

mc anonymous set-json /tmp/minio-policy.json "$MINIO_ALIAS/$BUCKET_NAME" &> /dev/null

if [ $? -eq 0 ]; then
    echo "✓ Public read policy applied"
else
    echo "⚠ Warning: Failed to set policy (may already be set)"
fi
rm /tmp/minio-policy.json
echo ""

# Enable versioning (optional)
echo "Enabling versioning on bucket..."
mc version enable "$MINIO_ALIAS/$BUCKET_NAME" &> /dev/null

if [ $? -eq 0 ]; then
    echo "✓ Versioning enabled"
else
    echo "⚠ Warning: Failed to enable versioning"
fi
echo ""

echo "========================================="
echo "MinIO Initialization Complete!"
echo "========================================="
echo ""
echo "Bucket Details:"
echo "  Name: $BUCKET_NAME"
echo "  URL:  http://$MINIO_HOST/$BUCKET_NAME"
echo ""
echo "MinIO Console:"
echo "  URL: http://localhost:9001"
echo "  Username: $MINIO_USER"
echo "  Password: $MINIO_PASSWORD"
echo ""
echo "Environment Variables for API Server:"
echo "  AWS_ENDPOINT_URL=http://localhost:9000"
echo "  AWS_BUCKET_NAME=$BUCKET_NAME"
echo "  AWS_REGION=us-east-1"
echo "  AWS_ACCESS_KEY_ID=$MINIO_USER"
echo "  AWS_SECRET_ACCESS_KEY=$MINIO_PASSWORD"
echo ""
