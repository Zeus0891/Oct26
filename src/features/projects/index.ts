import { Router } from "express";
import projectMembersRoutes from "./routes/project-members.routes";
import projectTasksRoutes from "./routes/project-tasks.routes";
import projectsRoutes from "./routes/projects.routes";

// Projects Feature Router: mounted at /api/projects
const projectsRouter = Router();

// Mount sub-routers
projectsRouter.use("/projects", projectsRoutes);
projectsRouter.use("/tasks", projectTasksRoutes);
projectsRouter.use("/members", projectMembersRoutes);

export default projectsRouter;
