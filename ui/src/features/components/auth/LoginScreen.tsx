"use client";

import { ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  LoginProgressStep,
  LoginProgressTracker,
} from "@/features/components/auth/LoginProgressTracker";
import { AppLogo } from "@/features/components/shared/AppLogo";
import { useToast } from "@/features/hooks/useToast";
import { useSdkStore } from "@/features/store/useSdkStore";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/api-feedback";
import { buildCustomerJwt } from "@/lib/customer-jwt";
import {
  buildCustomerDetails,
  connectHostSocket,
} from "@/lib/inapp-sdk";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time notifications",
  },
  {
    icon: Users,
    title: "Customer-targeted delivery",
  },
  {
    icon: ShieldCheck,
    title: "Preference Management",
  },
  {
    icon: Sparkles,
    title: "Lightweight SDK",
  },
];

export function LoginScreen() {
  const toast = useToast();
  const login = useSdkStore((state) => state.login);
  const setCustomerDetails = useSdkStore((state) => state.setCustomerDetails);
  const setSocketStatus = useSdkStore((state) => state.setSocketStatus);
  const [customerJwtPrivateKey, setCustomerJwtPrivateKey] = useState("");
  const [customerSigningKeyId, setCustomerSigningKeyId] = useState("");
  const [customerUniqueCustomerId, setCustomerUniqueCustomerId] = useState("");
  const [customerWorkspaceId, setCustomerWorkspaceId] = useState("");
  const [customerProductSpaceCode, setCustomerProductSpaceCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [progressSteps, setProgressSteps] = useState<LoginProgressStep[]>([
    {
      key: "customer",
      title: "Mint customer JWT",
      description: "Creating the customer bearer token from the provided signing values.",
      status: "idle",
    },
    {
      key: "socket",
      title: "Establish websocket connection",
      description: "Opening the live channel for in-app notification events.",
      status: "idle",
    },
  ]);

  const errors = useMemo(
    () => ({
      customerJwtPrivateKey: submitted && !customerJwtPrivateKey.trim(),
      customerSigningKeyId: submitted && !customerSigningKeyId.trim(),
      customerUniqueCustomerId: submitted && !customerUniqueCustomerId.trim(),
      customerWorkspaceId: submitted && !customerWorkspaceId.trim(),
      customerProductSpaceCode: submitted && !customerProductSpaceCode.trim(),
    }),
    [
      customerJwtPrivateKey,
      customerProductSpaceCode,
      customerSigningKeyId,
      customerUniqueCustomerId,
      customerWorkspaceId,
      submitted,
    ]
  );

  function updateStep(
    key: LoginProgressStep["key"],
    status: LoginProgressStep["status"]
  ) {
    setProgressSteps((current) =>
      current.map((step) => (step.key === key ? { ...step, status } : step))
    );
  }

  function resetProgress() {
    setShowProgress(false);
    setProgressError(null);
    setProgressSteps([
      {
        key: "customer",
        title: "Mint customer JWT",
        description: "Creating the customer bearer token from the provided signing values.",
        status: "idle",
      },
      {
        key: "socket",
        title: "Establish websocket connection",
        description: "Opening the live channel for in-app notification events.",
        status: "idle",
      },
    ]);
  }

  const initializeSession = useCallback(async (auth: {
    customerJwtPrivateKey: string;
    customerSigningKeyId: string;
    customerUniqueCustomerId: string;
    customerWorkspaceId: string;
    customerProductSpaceCode: string;
  }) => {
    setShowProgress(true);
    setProgressError(null);
    setSocketStatus("disconnected");
    setProgressSteps([
      {
        key: "customer",
        title: "Mint customer JWT",
        description: "Creating the customer bearer token from the provided signing values.",
        status: "loading",
      },
      {
        key: "socket",
        title: "Establish websocket connection",
        description: "Opening the live channel for in-app notification events.",
        status: "pending",
      },
    ]);

    try {
      const jwtToken = await buildCustomerJwt({
        privateKey: auth.customerJwtPrivateKey,
        signingKeyId: auth.customerSigningKeyId,
        uniqueCustomerId: auth.customerUniqueCustomerId,
        workspaceId: auth.customerWorkspaceId,
        productSpaceCode: auth.customerProductSpaceCode,
      });
      updateStep("customer", "success");
      toast.success("Customer JWT minted successfully.");

      updateStep("socket", "loading");
      const socketResponse = await connectHostSocket(
        {
          customerUniqueCustomerId: auth.customerUniqueCustomerId,
          jwtToken,
        },
        setSocketStatus
      );
      toast.success(getApiSuccessMessage(socketResponse, "WebSocket connection established."));
      updateStep("socket", "success");

      login({
        ...auth,
        jwtToken,
      });
      setCustomerDetails(buildCustomerDetails(auth.customerUniqueCustomerId));
      setSocketStatus("connected");
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to initialize the session.");
      setProgressError(message);
      toast.error(message);
      setSocketStatus("error");
      setProgressSteps((current) =>
        current.map((step) =>
          step.status === "loading" ? { ...step, status: "error" } : step
        )
      );
    }
  }, [login, setCustomerDetails, setSocketStatus, toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (
      !customerJwtPrivateKey.trim() ||
      !customerSigningKeyId.trim() ||
      !customerUniqueCustomerId.trim() ||
      !customerWorkspaceId.trim() ||
      !customerProductSpaceCode.trim()
    ) {
      return;
    }

    await initializeSession({
      customerJwtPrivateKey: customerJwtPrivateKey.trim(),
      customerSigningKeyId: customerSigningKeyId.trim(),
      customerUniqueCustomerId: customerUniqueCustomerId.trim(),
      customerWorkspaceId: customerWorkspaceId.trim(),
      customerProductSpaceCode: customerProductSpaceCode.trim(),
    });
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden bg-muted px-6 py-10 lg:px-12 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,159,127,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(56,159,127,0.14),transparent_32%)]" />
          <div className="relative mx-auto flex h-full max-w-2xl items-center justify-center">
            <div className="w-full space-y-7">
              <AppLogo />
              <div className="max-w-xl space-y-5">
                <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
                  DokaaI In-App Notifications
                </h1>
                <p className="max-w-lg text-base leading-7 text-muted-foreground">
                  Use your customer signing values to mint a bearer token locally and preview the in-app notification experience.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {FEATURES.map(({ icon: Icon, title }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-black/15 bg-white/80 p-5 shadow-card backdrop-blur"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 lg:px-12">
          <Card className="w-full max-w-xl border-slate-200 shadow-soft">
            <CardContent>
              {showProgress ? (
                <LoginProgressTracker
                  onRetry={() =>
                    void initializeSession({
                      customerJwtPrivateKey: customerJwtPrivateKey.trim(),
                      customerSigningKeyId: customerSigningKeyId.trim(),
                      customerUniqueCustomerId: customerUniqueCustomerId.trim(),
                      customerWorkspaceId: customerWorkspaceId.trim(),
                      customerProductSpaceCode: customerProductSpaceCode.trim(),
                    })
                  }
                  onBack={resetProgress}
                  steps={progressSteps}
                />
              ) : (
                <div>
                  <CardHeader>
                    <CardTitle className="text-3xl text-center">Sign in</CardTitle>
                    <CardDescription className="text-center">
                      Enter the customer JWT signing values to start the demo session.
                    </CardDescription>
                  </CardHeader>
                  <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground" htmlFor="customerJwtPrivateKey">
                        Customer JWT Private Key
                      </label>
                      <textarea
                        id="customerJwtPrivateKey"
                        value={customerJwtPrivateKey}
                        onChange={(event) => setCustomerJwtPrivateKey(event.target.value)}
                        placeholder='-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'
                        aria-invalid={errors.customerJwtPrivateKey}
                        className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      {errors.customerJwtPrivateKey ? <p className="text-xs text-red-600">private key is required.</p> : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground" htmlFor="customerSigningKeyId">
                          Customer Signing Key ID
                        </label>
                        <Input
                          id="customerSigningKeyId"
                          value={customerSigningKeyId}
                          onChange={(event) => setCustomerSigningKeyId(event.target.value)}
                          placeholder="Enter signing key id"
                          aria-invalid={errors.customerSigningKeyId}
                        />
                        {errors.customerSigningKeyId ? <p className="text-xs text-red-600">signing key id is required.</p> : null}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground" htmlFor="customerUniqueCustomerId">
                          Unique Customer ID
                        </label>
                        <Input
                          id="customerUniqueCustomerId"
                          value={customerUniqueCustomerId}
                          onChange={(event) => setCustomerUniqueCustomerId(event.target.value)}
                          placeholder="Enter unique customer id"
                          aria-invalid={errors.customerUniqueCustomerId}
                        />
                        {errors.customerUniqueCustomerId ? <p className="text-xs text-red-600">unique customer id is required.</p> : null}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground" htmlFor="customerWorkspaceId">
                          Customer Workspace ID
                        </label>
                        <Input
                          id="customerWorkspaceId"
                          value={customerWorkspaceId}
                          onChange={(event) => setCustomerWorkspaceId(event.target.value)}
                          placeholder="Enter workspace id"
                          aria-invalid={errors.customerWorkspaceId}
                        />
                        {errors.customerWorkspaceId ? <p className="text-xs text-red-600">workspace id is required.</p> : null}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground" htmlFor="customerProductSpaceCode">
                          Customer Product Space Code
                        </label>
                        <Input
                          id="customerProductSpaceCode"
                          value={customerProductSpaceCode}
                          onChange={(event) => setCustomerProductSpaceCode(event.target.value)}
                          placeholder="Enter product space code"
                          aria-invalid={errors.customerProductSpaceCode}
                        />
                        {errors.customerProductSpaceCode ? <p className="text-xs text-red-600">product space code is required.</p> : null}
                      </div>
                    </div>
                    <div className="pt-5">
                      <Button className="w-full" size="lg" type="submit">
                        Open dashboard
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
