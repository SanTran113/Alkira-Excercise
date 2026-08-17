# Alkira Excercise
A single page app demonstrating login, MFA, form validation, and basic access control.

## Technologies Used
- React + Javascript + CSS
- React Router DOM (for client side routing)
- React Context for global auth state
- localStorage for data persistence
- Vitest for testing

## Setup/Install Instructions
1. Clone the project.
2. Run npm install.

## Local Run Instructions
- Run npm run dev

## Mock User Credentials / Roles
Can be found in data/users.jsx
Admin (Read/Write):
- Username: homer
- Password: theOdyssey
Guest (Read-only):
- Username: tomHolland
- Password: spiderman123

## How to Test the Login / MFA Flow
Manually:
1. Go to Login Page (/).
2. Enter a valid username and password.
3. On success, you  will be redirected to /mfa, where a 6-digit code will be displayed left of "Code."
4. Enter the displayed code into the "Input Code" text box and click Verify. The code will expire after 30 seconds, in which case you may click "Resend Code" to recieve another code.
Automated:
- Run "npm test"

## Key Design Decisions and Assumptions
- Two-step auth: login()  validates credentials and stores a pendingUser. The user isn't actually "logged in" (localStorage) until the user is verified. 
- OTP shown on-screen rather than sent via email or SMS.
- Role gating in UI: MainPage (Network connections page) checks if the user role equals to an "Admin" to show Edit controls, wheres "Guest" users are only able to read.
- Each connection is "in progress" when in editing mode until it is Saved or Canceled.
- LocalStorage was used for data persistance in the current user session, signuped users, and any edited network connections.

## Known Limitations
- Plaintext password storage: passwords are stored in plaintext in the static users.jsx file and in localStorage (signedUpUsers) which are not hashed/salted.
- OTP expiry window is short, with no UI countdown shown to the user
- No password confirmation field on Signup, and no password strength/format validation.
