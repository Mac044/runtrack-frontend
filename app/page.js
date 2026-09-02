"use client";

import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user, loading, signIn, logOut } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold">RunTrack</h1>
        <p className="text-neutral-400">Track your runs. See your pace. Beat yesterday.</p>
        <button
          onClick={signIn}
          className="rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:opacity-90"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Hey, {user.displayName?.split(" ")[0] || "Runner"}</h1>
      <p className="text-neutral-400">You&apos;re signed in. Let&apos;s build the rest from here.</p>
      <button onClick={logOut} className="text-sm text-neutral-400 underline">
        Sign out
      </button>
    </div>
  );
}