import { Resend } from 'resend';
import { NextResponse } from 'next/server';

 export async function POST(request: Request) {
    const email = await request.json();
    console.log(email);

    const resend = new Resend(process.env.RESEND_API_KEY);

    // create an account 
    const {error: createError} = await resend.contacts.create({
        email: email,
    })
    console.log(createError,'ceate error');
    if(createError) {
        return NextResponse.json({error: createError.message},{status: 500})
    }

    // add account to contact list
    const {error: addError} = await resend.contacts.segments.add({
        email: email,
        segmentId:"ea864d9e-02b1-4205-9cdc-835c7a2c84e5"
    })
    console.log(addError,'add error');
    if(addError) {
        return NextResponse.json({error: addError.message},{status: 500})
    }
    return NextResponse.json({message: "Subscribed successfully!"});
}