# Email Verification Implementation

This document outlines the email verification feature implemented in the MarkdownPreview application.

## Overview

The email verification system ensures that users verify their email addresses after signup to access all features and maintain account security. This implementation uses Appwrite's built-in email verification capabilities.

## Components

### 1. Auth Service Methods (`src/services/auth.js`)

- `sendEmailVerification(url)` - Sends verification email to current user
- `verifyEmail(userId, secret)` - Completes verification with tokens from email link
- `isEmailVerified()` - Checks if current user's email is verified

### 2. Verification Page (`src/pages/VerifyEmail.jsx`)

- Handles verification links clicked from emails
- Parses userId and secret from URL parameters
- Shows success/error states with appropriate actions
- Provides resend verification option on failure

### 3. Email Verification Banner (`src/components/EmailVerificationBanner.jsx`)

- Shows reminder banner for unverified users
- Dismissible (stores state in localStorage)
- Provides quick resend verification action
- Auto-hides for verified users

### 4. Profile Integration (`src/pages/Profile.jsx`)

- Shows verification status in profile
- Manual verification email sending option
- Visual indicators for verified/unverified status

## User Flow

### Signup Flow
1. User creates account through signup form
2. Account is created and user is automatically logged in
3. Verification email is sent automatically (non-blocking)
4. Success toast shows signup completion
5. Info toast reminds user to check email for verification

### Login Flow
1. User logs in with email/password
2. After successful login, verification status is checked
3. Unverified users get a gentle reminder toast
4. User can access the app but sees verification reminders

### Verification Flow
1. User clicks verification link in email
2. App extracts userId and secret from URL
3. Verification API call is made to Appwrite
4. Success: User sees confirmation and can continue to dashboard
5. Failure: Error message with option to resend verification

### Dashboard Experience
1. Unverified users see a dismissible banner at top
2. Banner provides quick access to resend verification
3. Banner disappears once email is verified

## Routes

- `/verify-email` - Email verification completion page
- Supports query parameters: `userId` and `secret`

## Security Features

- Verification tokens are generated by Appwrite (secure)
- Links have expiration times set by Appwrite
- Failed verifications show appropriate error messages
- Users can still use the app while unverified (gradual verification)

## Configuration

The verification email URL is automatically set to:
```
${window.location.origin}/verify-email
```

This ensures the verification links work correctly across different environments (development, staging, production).

## Error Handling

- Network errors during verification
- Expired verification links
- Invalid verification tokens
- Failed email sending attempts

All errors are handled gracefully with user-friendly messages and retry options.

## Testing

To test email verification:

1. **Signup Flow**: Create a new account and check that verification email is sent
2. **Verification Page**: Visit `/verify-email?userId=test&secret=test` to see error handling
3. **Banner Display**: Login with unverified account to see banner
4. **Profile Integration**: Check profile page for verification status
5. **Resend Function**: Test resend verification from banner and profile

## Future Enhancements

- Email templates customization through Appwrite
- Verification requirements for sensitive operations
- Email change verification flow
- Admin verification status management
