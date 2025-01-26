import Home from "./pages/Home";
import Login from "./pages/Login";
import CanvasPage from "./pages/CanvasPage";
import NotFound from "./pages/NotFound";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/canvas", component: CanvasPage, isProtected: true },
  { path: "*", component: NotFound },
];

export default routes;