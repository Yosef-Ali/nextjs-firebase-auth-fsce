// components/Newsletter.tsx
"use client"

import React, { FC, ChangeEvent, FormEvent, useState } from 'react';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const Newsletter: FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePrivacyCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAgreedToPrivacy(e.target.checked);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Perform newsletter subscription logic
  };

  return (
    // <div className="bg-white border border-gray-400 mt-5 rounded-sm overflow-hidden">
    //   <form>
    //     <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-lg">
    //       <div className="space-y-4">
    //         <div>
    //           <Label htmlFor="name">Name</Label>
    //           <Input className="mt-1" id="name" placeholder="First Name" />
    //         </div>
    //         <div>
    //           <Label htmlFor="email">Email</Label>
    //           <Input className="mt-1" id="email" placeholder="Email Address" type="email" />
    //         </div>
    //         <div className="flex items-center gap-4">
    //           <Checkbox id="terms" />
    //           <label className="text-sm font-medium leading-none" htmlFor="terms">
    //             I agree to the
    //             <Link href="#">terms and conditions</Link>
    //           </label>
    //         </div>
    //       </div>
    //       <Button className="w-full" formMethod="dialog" type="submit">
    //         Submit
    //       </Button>
    //     </div>
    //   </form>
    // </div>
    <Card className="w-full bg-muted ">
      <CardHeader className="space-y-2 text-center">
        <CardTitle>Subscribe to our newsletter</CardTitle>
        <CardDescription>Get the news right in your inbox!</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="First Name" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Email Address" type="email" />
            </div>
            <div className="flex items-center gap-4">
              <Checkbox id="terms" />
              <Label className="text-sm leading-none " htmlFor="terms">
                I agree to the
                <Link href="#">terms and conditions</Link>
              </Label>
            </div>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </CardContent>

    </Card>
  );
};

export default Newsletter;



