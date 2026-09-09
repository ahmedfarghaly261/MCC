import AppRoutes from "./routes/routes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster richColors position="bottom-right" theme="dark" />
    </>
  );
}

export default App;
