// Import Dependencies
import { useState } from "react";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router";

// Local Imports
import logo from "@/assets/logo.png";
import { Button, Card, Input, InputErrorMsg } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { AuthFormValues, schema } from "./schema";
import { Page } from "@/components/shared/Page";

// ----------------------------------------------------------------------

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
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

  // Auth init hone tak kuch render mat karo (login form flash na ho)
  if (!isInitialized) {
    return null;
  }

  // Already logged-in ho to seedha redirect
  if (isAuthenticated) {
    return <Navigate to="/select-company" replace />;
  }

  const onSubmit = async (data: AuthFormValues) => {
    const success = await login({
      email: data.email,
      password: data.password,
    });

    if (success) {
      navigate("/select-company", { replace: true });
    }
  };

  return (
    <Page title="Vendor Login">
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full">
          <div className="grid min-h-screen grid-cols-1 gap-0 overflow-hidden lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center bg-white p-6 sm:p-8 lg:p-10">
              <Card
                className="w-full rounded-lg bg-transparent p-5 lg:p-7"
                style={{ overflow: "visible" }}
              >
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                  <img
                    src={logo}
                    alt="KrushiMall"
                    className="h-14 w-auto object-contain sm:h-28"
                  />
                </div>

                <div className="border-primary-600 dark:border-primary-400 w-full rounded-[40px] border-y-[6px]"></div>

                <div className="mt-6 text-left">
                  <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                    Welcome to{" "}
                    <span className="text-primary-600">KrushiMall</span>
                  </h2>
                  {/* <p className="mt-1 leading-relaxed text-gray-600">
                    Please sign in to continue
                  </p> */}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                  <div className="mt-6 space-y-4">
                    <Input
                      label="Email"
                      placeholder="Enter Email"
                      prefix={
                        <EnvelopeIcon
                          className="size-5 text-gray-500"
                          strokeWidth="1"
                        />
                      }
                      className="focus:border-primary border-gray-300 bg-white text-gray-800"
                      {...register("email")}
                      error={errors?.email?.message}
                    />
                    <Input
                      label="Password"
                      placeholder="Enter Password"
                      type={showPassword ? "text" : "password"}
                      prefix={
                        <LockClosedIcon
                          className="size-5 text-gray-500"
                          strokeWidth="1"
                        />
                      }
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="size-5" />
                          ) : (
                            <EyeIcon className="size-5" />
                          )}
                        </button>
                      }
                      className="focus:border-primary border-gray-300 bg-white text-gray-800"
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

            {/* Right Side - Image */}
            <div className="relative hidden items-center justify-center lg:flex">
              <img
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a"
                alt="company"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </Page>
  );
}