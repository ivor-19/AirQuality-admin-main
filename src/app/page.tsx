"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useAuth } from "./context/AuthContext";


const FormSchema = z.object({
  accountId: z.string().min(1, { message: "Please enter your account ID." }),
  password: z.string().min(1, { message: "Please enter your password." }),
});

type FormData = z.infer<typeof FormSchema>;

export default function Home() {
  const { register, handleSubmit, formState: {errors}, reset, setError } = useForm<FormData>({
      resolver: zodResolver(FormSchema),
  })

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [errorDescription, setErrorDescription] = useState("");
  const { login } = useAuth();

  const handleLogin = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await axios.post("https://air-quality-back-end-v2.vercel.app/users/login", {account_id: data.accountId, password: data.password})
      const { user, token } = response.data;
      
      // Store both user data and token
      login(user, token);
      
      if(user.role === "Admin"){
        router.replace("/admin")
        setErrorAlert(false);
      }
      else{
        setErrorAlert(true);
        setErrorDescription("Wrong account ID or password. Please try again.")
        setLoading(false);
      }

    } catch (error) {
      setLoading(false);
      if(axios.isAxiosError(error) && error.response){
        const errorMessage = error.response.data.message;
        if(errorMessage === "Student does not exists"){
          setErrorDescription("Account do not exists. Please try again.")
          setErrorAlert(true);
        } 
        else if (errorMessage === "Invalid id or password"){
          setErrorDescription("Wrong account ID or password. Please try again.")
          setErrorAlert(true);
        }
        else {
          // Handle other error messages
          console.log(`Login error: ${errorMessage}`);
          // setErrorMessage(errorMessage);
        }
      }
      else{
        console.error("Error logging in: ", error);
      }
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 font-geist">
      <div className="w-full max-w-sm">
      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex items-center justify-center rounded-md">
                <img src="/leaf-adaptive-icon.png" className="w-12 h-12" />

              </div>
              <span className="sr-only">Air Guard</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Air Guard</h1>
          </div>
          <div className="flex flex-col gap-6">
            {errorAlert &&
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorDescription}
                </AlertDescription>
              </Alert>
            }
            <div className="grid gap-2">
              <Label htmlFor="email">Account ID</Label>
              <Input
                id="accountId"
                type="text"
                {...register("accountId")}
                placeholder=""
                required
              />
              {errors.accountId && <span className="text-red-500 text-xs font-geist">{errors.accountId.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder=""
                required
              />
              {errors.password && <span className="text-red-500 text-xs font-geist">{errors.password.message}</span>}
            </div>
            <Button onClick={handleSubmit(handleLogin)} className="w-full">
              {loading ? (
                <Loader2 className="animate-spin" />
              ):(
                <>Login</>
              )}
            </Button>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="outline" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </form>
      <div className="mt-4 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
      </div>
    </div>
  );
}
