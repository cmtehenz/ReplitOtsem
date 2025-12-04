#!/bin/bash
# Start server with OpenSSL legacy provider for Banco Inter mTLS compatibility
export NODE_OPTIONS='--openssl-legacy-provider'
exec npm run dev
