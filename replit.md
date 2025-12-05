# Otsem Pay - Crypto Wallet with Real PIX Integration

## Overview
Otsem Pay is a production-ready cryptocurrency wallet application featuring real Brazilian PIX integration via Banco Inter API. The app enables users to deposit and withdraw BRL through PIX, and exchange between BRL and USDT.

## Current State
- **Production Ready**: Real banking integration with Banco Inter API
- **Authentication**: Secure user authentication with bcrypt password hashing and session management
- **PIX Integration**: Deposit (QR code generation) and withdrawal via real banking API
- **Exchange**: BRL ↔ USDT exchange functionality with OKX rates
- **Real-time Notifications**: WebSocket-based push notifications for account activities
- **Profile Management**: Name, email, phone editing and profile photo upload
- **Security Features**: Password change, 2FA with TOTP, WebAuthn biometric login (FaceID/TouchID)
- **Crypto Wallets**: Real wallet addresses for BTC and USDT with QR code display
- **Price Charts**: Interactive price charts with multiple time ranges (1H, 1D, 1W, 1M, 1Y)
- **Transaction Export**: PDF receipt generation and Web Share API for sharing
- **Referral Program**: Referral rewards tracking with crypto wallet address generation
- **KYC Verification**: Document upload with camera/file picker for identity verification
- **Crypto News**: Real-time crypto news feed from API
- **Email Verification**: Token-based email verification flow
- **Password Reset**: Secure password reset via email token
- **Bilingual**: Full support for English and Portuguese (PT-BR)

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with custom design system
- **Banking**: Banco Inter API with OAuth2 + mTLS
- **Real-time**: WebSocket with secure token-based authentication

## Design System
- **Primary Color**: Purple (hsl(265 90% 65%))
- **Accent Color**: Gold (hsl(45 95% 55%))
- **Border Radius**: 12px for cards, 2xl for buttons
- **Style**: Clean, minimal fintech aesthetic (Revolut/Mercury inspired)

## Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Language)
│   │   ├── pages/         # Page components
│   │   └── lib/           # API client and utilities
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   ├── inter-api.ts       # Banco Inter API client
│   └── db.ts              # Database connection
└── shared/
    └── schema.ts          # Drizzle database schema
```

## Environment Secrets
Required secrets (stored in Replit Secrets):
- `DATABASE_URL`: PostgreSQL connection string
- `INTER_CLIENT_ID`: Banco Inter API client ID
- `INTER_CLIENT_SECRET`: Banco Inter API client secret
- `INTER_PRIVATE_KEY`: mTLS private key (PEM format)
- `INTER_CERTIFICATE`: mTLS certificate (PEM format)
- `SESSION_SECRET`: Express session secret

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update user profile
- `GET /api/auth/ws-token` - Get WebSocket authentication token
- `POST /api/auth/change-password` - Change user password

### Security (2FA & WebAuthn)
- `GET /api/auth/2fa/status` - Get 2FA status
- `POST /api/auth/2fa/setup` - Setup 2FA (generate QR code and backup codes)
- `POST /api/auth/2fa/verify` - Verify 2FA code and enable
- `POST /api/auth/2fa/disable` - Disable 2FA
- `GET /api/auth/login-history` - Get user's login session history
- `POST /api/auth/logout-all-sessions` - Logout from all devices
- `GET /api/auth/webauthn/credentials` - Get user's WebAuthn credentials
- `POST /api/auth/webauthn/register` - Register new WebAuthn credential
- `POST /api/auth/webauthn/verify` - Verify WebAuthn for login
- `DELETE /api/auth/webauthn/credentials/:id` - Delete WebAuthn credential

### Wallets & Transactions
- `GET /api/wallets` - Get user's wallet balances
- `GET /api/transactions` - Get transaction history
- `POST /api/exchange` - Execute currency exchange

### KYC & Limits
- `GET /api/kyc/status` - Get KYC level and monthly transaction limits

### PIX Operations
- `POST /api/pix/deposit` - Create PIX deposit (generate QR code)
- `GET /api/pix/deposits/pending` - Get pending deposits
- `POST /api/pix/withdraw` - Request PIX withdrawal
- `GET /api/pix/withdrawals` - Get withdrawal history

### PIX Keys
- `GET /api/pix-keys` - Get user's registered PIX keys
- `POST /api/pix-keys` - Add new PIX key
- `DELETE /api/pix-keys/:id` - Remove PIX key

### Notifications
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/unread-count` - Get unread notification count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/mark-all-read` - Mark all notifications as read

### Webhooks
- `POST /api/webhooks/pix` - Banco Inter PIX payment webhook

## Database Schema
- `users` - User accounts with bcrypt-hashed passwords, KYC level (none/basic/full)
- `wallets` - User balances (BRL, USDT, BTC)
- `transactions` - All wallet activity
- `user_pix_keys` - Registered PIX keys for withdrawals
- `pix_deposits` - PIX deposit requests and status
- `pix_withdrawals` - PIX withdrawal requests and status
- `notifications` - Real-time notifications for account activities
- `webhook_logs` - Idempotency tracking for webhooks
- `login_sessions` - Login history with device/IP/location tracking
- `kyc_documents` - KYC document submissions and review status

## Recent Changes
- 2024-12-05: Added interactive price charts with multiple time ranges (1H, 1D, 1W, 1M, 1Y) using Recharts
- 2024-12-05: Created asset details page (/asset/:currency) with price statistics
- 2024-12-05: Implemented PDF receipt generation for transactions (print-to-PDF)
- 2024-12-05: Added Web Share API integration for sharing transaction receipts
- 2024-12-05: Implemented WebAuthn biometric login (FaceID/TouchID support)
- 2024-12-05: Added webauthn_credentials database table for credential storage
- 2024-12-05: Created email verification flow with token-based verification
- 2024-12-05: Implemented password reset with secure email token
- 2024-12-05: Added full bilingual translations to welcome, exchange-success, not-found, and pix-actions pages
- 2024-12-05: Implemented exchange success flow with real data storage (sessionStorage)
- 2024-12-05: Exchange now navigates to success page with actual transaction details
- 2024-12-05: Added login session tracking with device, IP, location metadata
- 2024-12-05: Created backend APIs for login history, crypto news, and transaction statistics
- 2024-12-05: Updated feed page to use real crypto news API
- 2024-12-05: Updated security page to display actual login history from database
- 2024-12-05: Updated stats page to use real transaction data
- 2024-12-05: Fixed receive button to show proper currency selection dialog
- 2024-12-05: Implemented KYC-based transaction limits (Basic: R$50k/month, Full: unlimited)
- 2024-12-05: Added KYC status display in profile page with real-time limit tracking
- 2024-12-05: Enforced limits on exchange and withdrawal endpoints
- 2024-12-05: Implemented security backend with password change and 2FA (TOTP)
- 2024-12-05: Added Two-Factor Authentication with Google Authenticator compatibility
- 2024-12-05: Added backup codes generation for 2FA recovery
- 2024-12-04: Implemented real-time notification system with secure WebSocket authentication
- 2024-12-04: Added profile management (name, email, phone, photo upload)
- 2024-12-04: Added notification triggers for deposits, withdrawals, and exchanges
- 2024-12-04: Implemented real Banco Inter API integration with mTLS
- 2024-12-04: Added secure authentication with bcrypt and sessions
- 2024-12-04: Built PIX deposit (QR code) and withdrawal flows
- 2024-12-04: Integrated PIX key management for withdrawals
- 2024-12-04: Added bilingual support (EN/PT-BR)

## User Preferences
- Production-first approach: No mock data
- Clean, minimal fintech design
- Bilingual interface (English and Portuguese)
- Real banking integration with Banco Inter

## Notes
- Webhook URL needs to be configured in Banco Inter dashboard
- mTLS certificates are required for all API calls
- Session cookies are HTTP-only for security
