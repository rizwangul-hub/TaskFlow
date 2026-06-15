import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthInitializer from "./components/auth/AuthInitializer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#1e293b",
              color: "#f8fafc",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#3b82f6", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </AuthInitializer>
    </BrowserRouter>
  );
};

export default App;
