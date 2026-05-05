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
import {
  connectHostSocket,
  createHostInAppSdkClient,
  fetchHostCustomerDetails,
  getSocketCustomerKeyFromCustomer,
  mapSdkCustomerToCustomerDetails,
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
  const [projectId, setProjectId] = useState("");
  const [orgId, setOrgId] = useState("");
  const [customerPoolId, setCustomerPoolId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [jwtToken, setJwtToken] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [progressSteps, setProgressSteps] = useState<LoginProgressStep[]>([
    {
      key: "customer",
      title: "Fetch customer details",
      description: "Validating the customer against the customer service.",
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
      projectId: submitted && !projectId.trim(),
      orgId: submitted && !orgId.trim(),
      customerPoolId: submitted && !customerPoolId.trim(),
      customerId: submitted && !customerId.trim(),
      jwtToken: submitted && !jwtToken.trim(),
    }),
    [customerId, customerPoolId, jwtToken, orgId, projectId, submitted]
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
        title: "Fetch customer details",
        description: "Validating the customer against the customer service.",
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
    projectId: string;
    orgId: string;
    customerPoolId: string;
    customerId: string;
    jwtToken: string;
  }) => {
    setShowProgress(true);
    setProgressError(null);
    setSocketStatus("disconnected");
    setProgressSteps([
      {
        key: "customer",
        title: "Fetch customer details",
        description: "Validating the customer against the customer service.",
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
      const client = createHostInAppSdkClient(auth);
      const customer = await fetchHostCustomerDetails(client, auth);
      toast.success(getApiSuccessMessage(customer, "Customer details fetched successfully."));
      updateStep("customer", "success");

      updateStep("socket", "loading");
      const uniqueCustomerId = getSocketCustomerKeyFromCustomer(customer) ?? auth.customerId;
      const socketResponse = await connectHostSocket(
        {
          ...auth,
          socketCustomerKey: uniqueCustomerId,
        },
        setSocketStatus
      );
      toast.success(getApiSuccessMessage(socketResponse, "WebSocket connection established."));
      updateStep("socket", "success");

      login(auth);
      setCustomerDetails(mapSdkCustomerToCustomerDetails(customer));
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
  }, [login, setCustomerDetails, setSocketStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (
      !projectId.trim() ||
      !orgId.trim() ||
      !customerPoolId.trim() ||
      !customerId.trim() ||
      !jwtToken.trim()
    ) {
      return;
    }

    await initializeSession({
      projectId: projectId.trim(),
      orgId: orgId.trim(),
      customerPoolId: customerPoolId.trim(),
      customerId: customerId.trim(),
      jwtToken: jwtToken.trim(),
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
                  A clean SDK demo for viewing in-app notifications with a production-ready UI structure, reusable components, and integration-ready architecture.
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
                      projectId: projectId.trim(),
                      orgId: orgId.trim(),
                      customerPoolId: customerPoolId.trim(),
                      customerId: customerId.trim(),
                      jwtToken: jwtToken.trim(),
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
                      Enter demo identifiers to preview the in-app notification experience.
                    </CardDescription>
                  </CardHeader>
                  <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground" htmlFor="projectId">
                          Project ID
                        </label>
                        <Input
                          id="projectId"
                          value={projectId}
                          onChange={(event) => setProjectId(event.target.value)}
                          placeholder="Enter projectId"
                          aria-invalid={errors.projectId}
                        />
                        {errors.projectId ? <p className="text-xs text-red-600">projectId is required.</p> : null}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground" htmlFor="orgId">
                          Org ID
                        </label>
                        <Input
                          id="orgId"
                          value={orgId}
                          onChange={(event) => setOrgId(event.target.value)}
                          placeholder="Enter orgId"
                          aria-invalid={errors.orgId}
                        />
                        {errors.orgId ? <p className="text-xs text-red-600">orgId is required.</p> : null}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground" htmlFor="customerPoolId">
                        Customer Pool ID
                      </label>
                      <Input
                        id="customerPoolId"
                        value={customerPoolId}
                        onChange={(event) => setCustomerPoolId(event.target.value)}
                        placeholder="Enter customerPoolId"
                        aria-invalid={errors.customerPoolId}
                      />
                      {errors.customerPoolId ? <p className="text-xs text-red-600">customerPoolId is required.</p> : null}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground" htmlFor="customerId">
                        Customer ID
                      </label>
                      <Input
                        id="customerId"
                        value={customerId}
                        onChange={(event) => setCustomerId(event.target.value)}
                        placeholder="Enter customerId"
                        aria-invalid={errors.customerId}
                      />
                      {errors.customerId ? <p className="text-xs text-red-600">customerId is required.</p> : null}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground" htmlFor="jwtToken">
                        JWT Token
                      </label>
                      <Input
                        id="jwtToken"
                        value={jwtToken}
                        onChange={(event) => setJwtToken(event.target.value)}
                        placeholder="Paste JWT token"
                        aria-invalid={errors.jwtToken}
                      />
                      {errors.jwtToken ? <p className="text-xs text-red-600">jwtToken is required.</p> : null}
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
