export const emailTemplates = {
  actionUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Template IDs for Firebase Email Templates
  templates: {
    userInvite: 'fsce-user-invitation',
    authorInvite: 'fsce-author-invitation',
    adminInvite: 'fsce-admin-invitation'
  },

  // Email content templates
  content: {
    user: {
      subject: 'Welcome to FSCE.org Blog - User Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">FSCE.org Blog Platform</h1>
          </div>
          <h2 style="color: #1f2937;">Welcome to FSCE.org!</h2>
          <p style="color: #4b5563; line-height: 1.5;">
            You have been invited to join the FSCE.org blog platform as a Reader. Our platform provides you with access to valuable articles, insights, and community discussions.
          </p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">As a Reader, you can:</h3>
            <ul style="color: #4b5563; margin: 10px 0;">
              <li>Read exclusive blog content</li>
              <li>Participate in discussions</li>
              <li>Save favorite articles</li>
              <li>Get notifications for new posts</li>
            </ul>
          </div>
          <div style="margin: 30px 0; text-align: center;">
            <a href="{{ link }}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Set Up Your Account
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you did not request this invitation, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            FSCE.org Blog Administration Team<br>
            <a href="https://www.fsc-e.org" style="color: #2563eb; text-decoration: none;">www.fsc-e.org</a>
          </p>
        </div>
      `
    },
    author: {
      subject: 'Welcome to FSCE.org Blog - Author Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">FSCE.org Blog Platform</h1>
          </div>
          <h2 style="color: #1f2937;">Welcome as an FSCE.org Blog Author!</h2>
          <p style="color: #4b5563; line-height: 1.5;">
            You have been invited to join FSCE.org as a Blog Author. This role grants you special privileges to create and publish content on our platform.
          </p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">As an Author, you can:</h3>
            <ul style="color: #4b5563; margin: 10px 0;">
              <li>Create and publish blog posts</li>
              <li>Manage your published articles</li>
              <li>Engage with readers' comments</li>
              <li>Access analytics for your content</li>
              <li>Collaborate with other authors</li>
            </ul>
          </div>
          <div style="margin: 30px 0; text-align: center;">
            <a href="{{ link }}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Set Up Your Account
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you did not request this invitation, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            FSCE.org Blog Administration Team<br>
            <a href="https://www.fsc-e.org" style="color: #2563eb; text-decoration: none;">www.fsc-e.org</a>
          </p>
        </div>
      `
    },
    admin: {
      subject: 'Welcome to FSCE.org Blog - Administrator Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">FSCE.org Blog Platform</h1>
          </div>
          <h2 style="color: #1f2937;">Welcome as an FSCE.org Blog Administrator!</h2>
          <p style="color: #4b5563; line-height: 1.5;">
            You have been invited to join FSCE.org as a Blog Administrator. This role gives you full access to manage the platform, content, and users.
          </p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">As an Administrator, you can:</h3>
            <ul style="color: #4b5563; margin: 10px 0;">
              <li>Manage all users and their roles</li>
              <li>Review and moderate blog content</li>
              <li>Manage author permissions</li>
              <li>Access platform analytics</li>
              <li>Configure blog settings</li>
              <li>Manage categories and tags</li>
            </ul>
          </div>
          <div style="margin: 30px 0; text-align: center;">
            <a href="{{ link }}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Set Up Your Account
            </a>
          </div>
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #991b1b; margin: 0;">
              Important: As an administrator of FSCE.org, you will have access to sensitive information and content management capabilities. Please ensure you keep your login credentials secure.
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you did not request this invitation, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            FSCE.org Blog Administration Team<br>
            <a href="https://www.fsc-e.org" style="color: #2563eb; text-decoration: none;">www.fsc-e.org</a>
          </p>
        </div>
      `
    }
  },

  // Dynamic link settings
  dynamicLinks: {
    domainUriPrefix: process.env.NEXT_PUBLIC_FIREBASE_DYNAMIC_LINKS_PREFIX,
    link: process.env.NEXT_PUBLIC_APP_URL,
    android: {
      packageName: 'org.fsce.blog'
    },
    ios: {
      bundleId: 'org.fsce.blog'
    }
  }
};
