After cloning the Project:

1. Create a .env.local file and load it with the following data:
# Clerk — https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Convex — https://dashboard.convex.dev → Settings → URL & Deploy Key
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Piston container running on local host
PISTON_API_URL=http://localhost:2000

[NOTE]: Install and set up docker CLI in your system -> Clone Piston_API repo and then follow it's README.md to set up and host the Piston_API locally.

2. After hosting Piston_API locally install all the required runtimes essential for code execution and match their version in app/root/_constant/index.ts file.

3. Copy paste the base URL for the hosted Piston container in the .env file.