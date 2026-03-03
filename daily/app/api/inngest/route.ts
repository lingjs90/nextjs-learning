import { serve} from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/function";

export const {GET,POST,PUT} = serve({
    client:inngest,
    functions:[
        // your functions will be passed here later
        helloWorld
    ]
})
        // Here you can add your logic to save the email to your database
        // For example, using a simple in-memory array (not recommended for production)