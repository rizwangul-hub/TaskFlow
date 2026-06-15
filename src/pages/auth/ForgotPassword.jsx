import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { requestPasswordReset } from "../../features/auth/authSlice.js";
import AuthCard from "../../components/auth/AuthCard.jsx";
import FormInput from "../../components/common/FormInput.jsx";
import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getErrorMessage } from "../../utils/errorHandler.js";
import { ROUTES } from "../../utils/constants.js";

const ForgotPassword = () => {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    const result = await forgotPassword(data.email);
    if (requestPasswordReset.fulfilled.match(result)) {
      setSubmitted(true);
      toast.success("Password reset email sent");
    }
  };

  if (submitted) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="If an account exists for that address, we've sent password reset instructions."
        footer={
          <Link to={ROUTES.LOGIN} className="link">
            Back to sign in
          </Link>
        }
      >
        <div className="rounded-xl bg-brand-50 p-4 text-center text-sm text-brand-800">
          Password reset email sent. Please check your inbox and follow the link
          to reset your password.
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <Link to={ROUTES.LOGIN} className="link">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />

        <Button type="submit" loading={loading}>
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;
