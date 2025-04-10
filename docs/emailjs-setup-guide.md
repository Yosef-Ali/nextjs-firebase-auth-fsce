# EmailJS Setup Guide for FSCE Contact Form

This guide will help you properly set up EmailJS to make the contact form work correctly.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/) and sign up for an account
2. Verify your email address

## Step 2: Add an Email Service

1. In the EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Name your service (e.g., "service_fsce")

## Step 3: Create an Email Template

1. Go to "Email Templates" in the dashboard
2. Click "Create New Template"
3. Design your template with the following variables:
   - `from_name` - The name of the person sending the message
   - `from_email` - The email of the person sending the message
   - `subject` - The subject of the message
   - `message` - The content of the message
   - `to_email` - The admin email (meazi2008@gmail.com)
4. Name your template (e.g., "template_contact_form")

## Step 4: Update Environment Variables

1. Open your `.env.local` file
2. Update the following variables with your actual values:
   ```
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
   ```

## Step 5: Test the Contact Form

1. Start your development server
2. Go to the contact page
3. Fill out the form and submit
4. Check the browser console for any errors
5. Verify that the email is received at meazi2008@gmail.com

## Troubleshooting

If you encounter issues:

1. Check the browser console for error messages
2. Verify that all environment variables are correctly set
3. Make sure your EmailJS account is active and not rate-limited
4. Confirm that your email template contains all the required variables
5. Check if your email service is properly connected

## Additional Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [React Integration Guide](https://www.emailjs.com/docs/examples/reactjs/)
