# PowerTrust Energy Limited

PowerTrust Energy Limited is a modern service and training platform for electrical systems, solar and backup power, and plumbing infrastructure in Delta State, Nigeria.

The website includes a responsive public experience, project media stream, training registration, payment tracking, certificate management, and a protected operations portal for administrators.

## Platform highlights

- Electrical, solar, and plumbing service pages
- Responsive project stream with masonry media, progressive loading, and image or video viewer
- Technical training registration with 4, 8, and 12 month programs
- Student, transaction, certificate, and media management
- First-user superadmin bootstrap with role-based admin access
- Firebase Cloud Firestore persistence
- Cloudinary image and video delivery
- Email notifications, verification codes, reminders, and certificates
- Custom PowerTrust branding, favicon, metadata, sitemap, robots rules, and 404 page
- Responsive layouts for desktop, tablet, and mobile

## Technology

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS
- Firebase Admin SDK and Cloud Firestore
- Cloudinary
- Nodemailer
- JSON Web Tokens and bcrypt
- Zod validation

## Requirements

- Node.js 24.x
- npm
- Firebase service-account credentials
- Cloudinary account
- SMTP email account

## Local setup

```bash
git clone https://github.com/ogaga2020/nexgen.git
cd nexgen
npm install
```

Create a local `.env` file. Never commit this file or a Firebase service-account JSON file.

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET=

EMAIL_USER=
EMAIL_PASS=
ADMIN_EMAIL=
JWT_SECRET=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Start development:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Firebase administration

Firebase credentials are read directly from environment variables. Hosting platforms do not need access to a local credential-file path.

When the admin collection is empty, the private operations portal displays the first-account setup. That account becomes the superadmin. Authenticated administrators can then create additional team accounts.

## Commands

```bash
npm run dev             # Start local development
npm run typecheck       # Validate TypeScript
npm run build           # Create a production build
npm run start           # Run the production server
npm run migrate:firestore
```

## Deployment

The application is designed for Vercel or another Node.js hosting platform.

1. Use Node.js 24.x.
2. Add all required environment variables in the hosting dashboard.
3. Keep `.env`, `.secrets`, and Firebase JSON credentials out of Git.
4. Set `NEXT_PUBLIC_BASE_URL` to the production URL.
5. Run `npm run build` as the build command.

## Contact

PowerTrust Energy Limited<br />
No. 28A James Ejawan Plaza, Ugborikoko, Airport Road, Delta State, Nigeria.

## License

Private business software. All rights reserved by PowerTrust Energy Limited.
