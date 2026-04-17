import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Button,
  FieldError,
  FieldGroup,
  InputGroup,
  Label,
  Spinner,
  Tabs,
  TextField,
} from "@heroui/react";
import { authClient } from "#/lib/client/auth";
import { useTransition, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";

const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export const Route = createFileRoute("/auth/")({
  component: AuthIndex,
});

function AuthIndex() {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState("");

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleTabChange = () => {
    setRootError("");
    signInForm.reset();
    signUpForm.reset();
  };

  const onSignIn = (data: SignInValues) => {
    setRootError("");
    startTransition(async () => {
      const { error } = await authClient.signIn.email(
        { email: data.email, password: data.password },
        {
          onSuccess: () => navigate({ to: "/app" }),
          onError: (ctx) => setRootError(ctx.error.message ?? "Sign in failed"),
        },
      );
      if (error) setRootError(error.message ?? "Sign in failed");
    });
  };

  const onSignUp = (data: SignUpValues) => {
    setRootError("");
    startTransition(async () => {
      const { error } = await authClient.signUp.email(
        { email: data.email, password: data.password, name: data.name },
        {
          onSuccess: () => navigate({ to: "/app" }),
          onError: (ctx) => setRootError(ctx.error.message ?? "Sign up failed"),
        },
      );
      if (error) setRootError(error.message ?? "Sign up failed");
    });
  };

  const signInWithGithub = () =>
    startTransition(async () => {
      await authClient.signIn.social({ provider: "github" });
    });

  return (
    <main>
      <div className="inner border-x border-dashed min-h-lvh justify-center flex-col flex py-24 relative">
        <div className="max-w-md w-full mx-auto border border-dashed p-1 rounded-2xl">
          <div className="border p-6 rounded-xl bg-surface shadow-xl shadow-black/6">
            <div className="size-10">
              <img src="/archon.svg" alt="Archon Logo" />
            </div>
            <h3 className="text-lg mb-1 mt-4">Welcome Back</h3>
            <p className="text-sm text-default-500">
              Sign in to your account or create a new one to get started
            </p>

            <Tabs
              className="mt-4"
              defaultSelectedKey="signin"
              onSelectionChange={() => handleTabChange()}
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Authentication">
                  <Tabs.Tab id="signin">
                    Sign In
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="signup">
                    Sign Up
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              <Tabs.Panel id="signin">
                <form id="signin-form" onSubmit={signInForm.handleSubmit(onSignIn)}>
                  <FieldGroup className="flex flex-col gap-3">
                    <Controller
                      name="email"
                      control={signInForm.control}
                      render={({ field, fieldState }) => (
                        <TextField variant="secondary" isInvalid={fieldState.invalid}>
                          <Label>Email</Label>
                          <InputGroup variant="secondary">
                            <InputGroup.Input
                              {...field}
                              aria-label="Email"
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                            />
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError>{fieldState.error?.message}</FieldError>
                          )}
                        </TextField>
                      )}
                    />

                    <Controller
                      name="password"
                      control={signInForm.control}
                      render={({ field, fieldState }) => (
                        <TextField variant="secondary" isInvalid={fieldState.invalid}>
                          <Label>Password</Label>
                          <InputGroup variant="secondary">
                            <InputGroup.Input
                              {...field}
                              aria-label="Password"
                              type="password"
                              placeholder="Min. 8 characters"
                              autoComplete="current-password"
                            />
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError>{fieldState.error?.message}</FieldError>
                          )}
                        </TextField>
                      )}
                    />

                    {rootError && <p className="text-sm text-danger">{rootError}</p>}

                    <Button
                      type="submit"
                      form="signin-form"
                      className="w-full"
                      isDisabled={isPending}
                    >
                      {isPending ? <Spinner /> : "Sign In"}
                    </Button>
                  </FieldGroup>
                </form>
              </Tabs.Panel>

              <Tabs.Panel id="signup">
                <form id="signup-form" onSubmit={signUpForm.handleSubmit(onSignUp)}>
                  <FieldGroup className="flex flex-col gap-3">
                    <Controller
                      name="name"
                      control={signUpForm.control}
                      render={({ field, fieldState }) => (
                        <TextField variant="secondary" isInvalid={fieldState.invalid}>
                          <Label>Name</Label>
                          <InputGroup variant="secondary">
                            <InputGroup.Input
                              {...field}
                              aria-label="Name"
                              placeholder="Your name"
                              autoComplete="name"
                            />
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError>{fieldState.error?.message}</FieldError>
                          )}
                        </TextField>
                      )}
                    />

                    <Controller
                      name="email"
                      control={signUpForm.control}
                      render={({ field, fieldState }) => (
                        <TextField variant="secondary" isInvalid={fieldState.invalid}>
                          <Label>Email</Label>
                          <InputGroup variant="secondary">
                            <InputGroup.Input
                              {...field}
                              aria-label="Email"
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                            />
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError>{fieldState.error?.message}</FieldError>
                          )}
                        </TextField>
                      )}
                    />

                    <Controller
                      name="password"
                      control={signUpForm.control}
                      render={({ field, fieldState }) => (
                        <TextField variant="secondary" isInvalid={fieldState.invalid}>
                          <Label>Password</Label>
                          <InputGroup variant="secondary">
                            <InputGroup.Input
                              {...field}
                              aria-label="Password"
                              type="password"
                              placeholder="Min. 8 characters"
                              autoComplete="new-password"
                            />
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError>{fieldState.error?.message}</FieldError>
                          )}
                        </TextField>
                      )}
                    />

                    {rootError && <p className="text-sm text-danger">{rootError}</p>}

                    <Button
                      type="submit"
                      form="signup-form"
                      className="w-full"
                      isDisabled={isPending}
                    >
                      {isPending ? <Spinner /> : "Create Account"}
                    </Button>
                  </FieldGroup>
                </form>
              </Tabs.Panel>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-3 text-xs text-default-400">or</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                variant="outline"
                onPress={signInWithGithub}
                isDisabled={isPending}
              >
                <img className="size-4" src="/brand/gh.png" alt="Github Logo" />
                Sign in with Github
              </Button>

              <Button className="w-full" variant="outline" isDisabled>
                <img className="size-4" src="/brand/google.png" alt="Google Logo" />
                Sign in with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
