import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const config = {
  apiKey: "AIzaSyCn9QGQsukqauLil4hcE7AQiVdoQRSH6q8",
  authDomain: "mutuals-bc.firebaseapp.com",
  projectId: "mutuals-bc",
  storageBucket: "mutuals-bc.appspot.com",
  messagingSenderId: "639768297614",
  appId: "1:639768297614:web:74d06bd28b62c597e889df",
};

export const app = initializeApp(config);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
