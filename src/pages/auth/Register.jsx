import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { register as registerThunk } from "../../features/auth/authSlice.js";
import AuthCard from "../../components/auth/AuthCard.jsx";
import FormInput from "../../components/common/FormInput.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getErrorMessage } from "../../utils/errorHandler.js";
import { ROUTES } from "../../utils/constants.js";

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    const { confirmPassword, ...payload } = data;
    void confirmPassword;

    const result = await registerUser(payload);
    if (registerThunk.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      navigate(ROUTES.HOME, { replace: true });
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start managing tasks with TaskFlow"
      footer={
        <p className="text-slate-600">
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN} className="link">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormInput
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register("name", { required: "Name is required" })}
        />

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

        <PasswordInput
          label="Password"
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
          Create account
        </Button>
      </form>
    </AuthCard>
  );
};

export default Register;
