import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { login as loginThunk } from "../../features/auth/authSlice.js";
import AuthCard from "../../components/auth/AuthCard.jsx";
import FormInput from "../../components/common/FormInput.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getErrorMessage } from "../../utils/errorHandler.js";
import { ROUTES } from "../../utils/constants.js";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError, setRememberMe, rememberMe } =
    useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    const result = await login(data);
    if (loginThunk.fulfilled.match(result)) {
      toast.success("Welcome back!");
      const redirectTo = location.state?.from?.pathname || ROUTES.HOME;
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue to TaskFlow"
      footer={
        <p className="text-slate-600">
          Don&apos;t have an account?{" "}
          <Link to={ROUTES.REGISTER} className="link">
            Create account
          </Link>
        </p>
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

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
          })}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Remember me
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="link">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
};

export default Login;
