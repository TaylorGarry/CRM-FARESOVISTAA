import "./config/load-env";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDatabase from "./config/database";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import passwordRoutes from "./routes/password.routes";
import { seedAccessMenu } from "./config/seedAccessMenu";
import { Role } from "./models/Auth/Role.model";
import  ipRestrictionRoutes  from "./routes/IpRestriction/IpRestriction.routes";
import bookingRoutes from "./routes/bookingRoutes/booking.routes";
import masterRoutes from "./routes/ManageMaster/master.routes";
import uploadRoutes from "./routes/bookingRoutes/upload.routes";
import breakTypeRoutes from "./routes/BreakRoutes/break.routes";
// dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "CRM Faresovista API is running",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/master", masterRoutes);
app.use('/api/ip-restrictions', ipRestrictionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/break-types', breakTypeRoutes);
app.use("/api", userRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectDatabase();
  // Older deployments created a unique department-role index. Roles may share a department.
  await Role.collection.dropIndex('department_role_1_delete_status_1').catch(() => undefined);
  await seedAccessMenu();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
