import { useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { resetPassword as resetPasswordThunk } from "../../features/auth/authSlice.js";
import AuthCard from "../../components/auth/AuthCard.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getErrorMessage } from "../../utils/errorHandler.js";
import { ROUTES } from "../../utils/constants.js";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = paramToken || searchParams.get("token");
  const { resetUserPassword, loading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
    }
  }, [token]);

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    if (!token) return;

    const result = await resetUserPassword({
      token,
      password: data.password,
    });

    if (resetPasswordThunk.fulfilled.match(result)) {
      toast.success("Password reset successful!");
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  if (!token) {
    return (
      <AuthCard
        title="Invalid reset link"
        subtitle="This password reset link is invalid or has expired."
        footer={
          <Link to={ROUTES.FORGOT_PASSWORD} className="link">
            Request a new link
          </Link>
        }
      >
        <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
          Please request a new password reset email to continue.
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Choose a strong password for your account"
      footer={
        <Link to={ROUTES.LOGIN} className="link">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <PasswordInput
          label="New password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />

        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
        />

        <Button type="submit" loading={loading}>
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
