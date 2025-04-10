# EmailJS Integration Setup

This document explains how to set up EmailJS for the contact form.

## What is EmailJS?

EmailJS is a service that allows you to send emails directly from client-side JavaScript without requiring a server. It's perfect for contact forms and other simple email sending needs.

## Setup Instructions

1. **Create an EmailJS Account**
   - Go to [EmailJS website](https://www.emailjs.com/) and sign up for an account
   - The free tier allows 200 emails per month

2. **Create an Email Service**
   - In your EmailJS dashboard, go to "Email Services"
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the instructions to connect your email account (meazi2008@gmail.com)

3. **Create an Email Template**
   - Go to "Email Templates" in your dashboard
   - Click "Create New Template"
   - Design your email template with the following variables:
     - `from_name`: The name of the person sending the message
     - `from_email`: The email of the person sending the message
     - `subject`: The subject of the message
     - `message`: The content of the message
     - `to_email`: The admin email (meazi2008@gmail.com)

4. **Get Your API Keys**
   - Go to "Account" > "API Keys"
   - Copy your Public Key

5. **Update Environment Variables**
   - Open the `.env.local` file in the project root
   - Update the following variables:
     ```
     NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
     NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
     NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
     ```

6. **Test the Contact Form**
   - Start your development server
   - Go to the contact page
   - Fill out the form and submit
   - Check that the email is received at meazi2008@gmail.com

## Troubleshooting

- If emails are not being sent, check the browser console for errors
- Verify that your EmailJS account is active and has available email quota
- Make sure all environment variables are correctly set
- Check that your email template has all the required variables

## Additional Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS React Integration](https://www.emailjs.com/docs/examples/reactjs/)
