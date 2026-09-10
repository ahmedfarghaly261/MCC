import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { getCurrentUser } from "./services/profile.service";
import type { CurrentUser } from "./types/profile.types";

function formatDate(value: string | null): string {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfileView() {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (isMounted) setUser(currentUser);
      })
      .catch((requestError: unknown) => {
        if (!isMounted) return;

        if (isAxiosError(requestError) && requestError.response?.status === 401) {
          setError("Your session has expired. Please sign in again.");
          return;
        }

        setError("Unable to load your profile right now.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">My Profile</h1>
        <p className="mt-2 text-sm text-slate-400">
          Your Mission Control operator information.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-8 text-sm text-slate-400">
          Loading profile...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-5 text-sm text-red-200">
          {error}
        </div>
      )}

      {user && (
        <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/75 shadow-2xl shadow-blue-950/20">
          <div className="border-b border-slate-700/70 bg-gradient-to-r from-blue-950/80 to-slate-900 p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-semibold text-white ring-4 ring-blue-500/20">
                {getInitials(user.name)}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
                <p className="mt-1 text-sm text-slate-400">Mission Control Operator</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-5">
              <div className="flex items-center gap-3 text-cyan-300">
                <Mail className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Email</span>
              </div>
              <p className="mt-3 break-all text-sm text-slate-200">{user.email}</p>
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-5">
              <div className="flex items-center gap-3 text-cyan-300">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Email status</span>
              </div>
              <p className="mt-3 text-sm text-slate-200">
                {user.email_verified_at ? "Verified" : "Not verified"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-5">
              <div className="flex items-center gap-3 text-cyan-300">
                <CalendarDays className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Member since</span>
              </div>
              <p className="mt-3 text-sm text-slate-200">{formatDate(user.created_at)}</p>
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-5">
              <div className="flex items-center gap-3 text-cyan-300">
                <UserRound className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Operator ID</span>
              </div>
              <p className="mt-3 text-sm text-slate-200">#{user.id}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
