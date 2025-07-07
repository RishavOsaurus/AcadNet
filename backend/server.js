import app from "./app.js";
import sequelize from './config/database.js';
import { 
  UserModel,
  StudyGroup,
  RefreshToken,
  Membership,
  Syllabus,
  Topic,
  SubTopic,
  AdditionalResource,
  OTP
 } from './models/index.model.js';

const PORT = process.env.BACKEND_PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    await sequelize.sync({alter: true, force: true})

    console.log('✅ Models synced successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at PORT ${PORT}`);
    });
  } catch (err) {
    console.error(`❌ Database connection error:`, err);
  }
};

startServer();
