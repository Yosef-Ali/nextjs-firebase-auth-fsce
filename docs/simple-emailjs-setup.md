# Simple EmailJS Setup for FSCE Contact Form

Follow these steps to set up EmailJS for your contact form:

## 1. Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/) and sign up for a free account
2. Verify your email address

## 2. Add an Email Service

1. In the EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose Gmail as your email provider
4. Connect your Gmail account (meazi2008@gmail.com)
5. Name your service "service_7vfe7yh" (already created)

## 3. Create an Email Template

1. Go to "Email Templates" in the dashboard
2. Click "Create New Template"
3. Use this simple template:

```
Subject: New Contact Form Submission: {{subject}}

Name: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}
```

4. Save the template as "template_fhbuhcq" (already created)

## 4. That's it!

The contact form is already configured to use these specific service and template IDs. Once you've completed the steps above, the form should work correctly.

If you need to change the service or template IDs, update them in the contact form code at:
`app/(marketing)/(routes)/contact/page.tsx`
