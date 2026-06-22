import cors from "cors";
import { env } from "./env";
const corsOptions = {
    origin: [env.CLIENT_URL, "http://localhost:3000"],
    credentials: true,
    method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
export default cors(corsOptions);
//# sourceMappingURL=cors.js.map