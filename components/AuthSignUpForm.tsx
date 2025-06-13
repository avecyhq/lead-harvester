"use client";
import React from "react";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function AuthSignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setSuccess('Check your email for a confirmation link!');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4 max-w-sm mx-auto">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing up...' : 'Sign Up'}
      </Button>
    </form>
  );
} 