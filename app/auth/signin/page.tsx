import AuthSignInForm from "../../../components/AuthSignInForm";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <AuthSignInForm />
    </div>
  );
} 