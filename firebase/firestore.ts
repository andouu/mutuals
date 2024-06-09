import { app } from "./init";
import { getFirestore } from "firebase/firestore";

export const db = getFirestore(app);
