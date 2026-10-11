import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import WhatWeDo from "../pages/what-we-do/page";
import HowWeWork from "../pages/how-we-work/page";
import LetsTalk from "../pages/lets-talk/page";
import Industries from "../pages/industries/page";
import Demo from "../pages/demo/page";
import EmpresaAuth from "../pages/demo/auth/empresa/page";
import CoachAuth from "../pages/demo/auth/coach/page";
import EmpleadoAuth from "../pages/demo/auth/empleado/page";
import EmpresaPanel from "../pages/demo/empresa/page";
import CoachPanel from "../pages/demo/coach/page";
import EmpleadoPanel from "../pages/demo/empleado/page";
import EmpleadoV2 from "../pages/demo/empleado-v2/page";
import EmpleadoV3 from "../pages/demo/empleado-v3/page";
import EmpleadoV4 from "../pages/demo/empleado-v4/page";
import EmpleadoV5 from "../pages/demo/empleado-v5/page";
import SurveysPage from "../pages/demo/surveys/page";
import TypeTestPage from "../pages/demo/test/page";
import AdminPage from "../pages/admin/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/what-we-do",
    element: <WhatWeDo />,
  },
  {
    path: "/how-we-work",
    element: <HowWeWork />,
  },
  {
    path: "/lets-talk",
    element: <LetsTalk />,
  },
  {
    path: "/industries",
    element: <Industries />,
  },
  {
    path: "/demo",
    element: <Demo />,
  },
  {
    path: "/demo/auth/empresa",
    element: <EmpresaAuth />,
  },
  {
    path: "/demo/auth/coach",
    element: <CoachAuth />,
  },
  {
    path: "/demo/auth/empleado",
    element: <EmpleadoAuth />,
  },
  {
    path: "/demo/empresa",
    element: <EmpresaPanel />,
  },
  {
    path: "/demo/coach",
    element: <CoachPanel />,
  },
  {
    path: "/demo/empleado",
    element: <EmpleadoPanel />,
  },
  {
    path: "/demo/empleado-v2",
    element: <EmpleadoV2 />,
  },
  {
    path: "/demo/empleado-v3",
    element: <EmpleadoV3 />,
  },
  {
    path: "/demo/empleado-v4",
    element: <EmpleadoV4 />,
  },
  {
    path: "/demo/empleado-v5",
    element: <EmpleadoV5 />,
  },
  {
    path: "/demo/surveys",
    element: <SurveysPage />,
  },
  {
    path: "/demo/test",
    element: <TypeTestPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
