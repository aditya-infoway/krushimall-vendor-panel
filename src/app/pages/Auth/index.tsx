// Import Dependencies
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router";

// Local Imports
import Logo from "@/assets/appLogo.svg?react";
import { Button, Card, Input, InputErrorMsg } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { AuthFormValues, schema } from "./schema";
import { Page } from "@/components/shared/Page";

// ----------------------------------------------------------------------

export default function SignIn() {
  const navigate = useNavigate();
  const { login, errorMessage, isAuthenticated, isInitialized } =
    useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Jab tak AuthProvider ka init() (token validate karne wala) complete
  // nahi hota, tab tak kuch render mat karo — nahi to login form
  // ek pal ke liye flash hoga, chahe user already logged-in ho.
  if (!isInitialized) {
    return null; // yahan chaho to apna loader/spinner laga sakte ho
  }

  // Agar valid token already localStorage me hai (isAuthenticated true),
  // to login page dikhane ki zarurat nahi — seedha redirect.
  if (isAuthenticated) {
    return <Navigate to="/select-company" replace />;
  }

  const onSubmit = async (data: AuthFormValues) => {
    const success = await login({
      email: data.email,
      password: data.password,
    });

    if (success) {
      navigate("/select-company", {
        replace: true,
      });
    }
  };

  return (
    <Page title="Vendor Login">
      <div className="flex h-screen">
        <div className="dark:bg-dark-700 flex w-full items-center justify-center bg-white xl:w-1/2">
          <div className="w-full max-w-md px-6">
            <div className="text-center">
              <Logo className="mx-auto size-16" />

              <div className="mt-4">
                <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                  Welcome Back
                </h2>

                <p className="text-gray-400 dark:text-dark-300">
                  Please sign in to continue
                </p>
              </div>
            </div>

            <Card className="mt-6 rounded-lg p-5 lg:p-7">
              <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <div className="space-y-4">
                  <Input
                    label="Email"
                    placeholder="Enter Email"
                    prefix={
                      <EnvelopeIcon
                        className="size-5 transition-colors duration-200"
                        strokeWidth="1"
                      />
                    }
                    {...register("email")}
                    error={errors?.email?.message}
                  />
                  <Input
                    label="Password"
                    placeholder="Enter Password"
                    type="password"
                    prefix={
                      <LockClosedIcon
                        className="size-5 transition-colors duration-200"
                        strokeWidth="1"
                      />
                    }
                    {...register("password")}
                    error={errors?.password?.message}
                  />
                </div>

                <div className="mt-2">
                  <InputErrorMsg
                    when={(errorMessage && errorMessage !== "") as boolean}
                  >
                    {errorMessage}
                  </InputErrorMsg>
                </div>

                <Button type="submit" className="mt-5 w-full" color="primary">
                  Sign In
                </Button>
              </form>
            </Card>
          </div>
        </div>

        <div className="hidden h-full xl:block xl:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a"
            alt="company"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </Page>
  );
}