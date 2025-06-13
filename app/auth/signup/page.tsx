import AuthSignUpForm from "../../../components/AuthSignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <AuthSignUpForm />
    </div>
  );
} 