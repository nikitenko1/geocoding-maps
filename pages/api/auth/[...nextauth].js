import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import dbConnect from "@/libs/dbConnect";
import { hash } from "bcrypt";

let AuthUser;

const options = {
  debug: process.env.NODE_ENV === "development",
  // Enable JSON Web Tokens since we will not store sessions in our DB
  session: {
    jwt: true,
  },
  // Here we add our login providers - this is where you could add Google or Github SSO as well
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      // The credentials object is what's used to generate Next Auths default login page
      credentials: {
        email: { label: "text", type: "text" },
        password: { label: "password", type: "password" },
      },
      // Authorize callback is ran upon calling the signin function
      authorize: async (credentials) => {
        await dbConnect();
        // Try to find the user and also return the password field
        const user = await User.findOne({ email: credentials?.email }).select("+password");
        if (!user) {
          throw new Error("No user Found With Email Please Sign Up!");
        }
        // Use the comparePassword method we defined in our user.js Model file to authenticate
        const pwValid = await user.comparePassword(credentials.password);

        if (!pwValid) {
          throw new Error("Invalid credentials || Your password is invalid");
        }

        return user;
      },
    }),
  ],

  // All of this is just to add user information to be accessible for our app in the token/session
  callbacks: {
    // We can pass in additional information from the user document MongoDB returns
    // This could be avatars, role, display name, etc...
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        };
      }
      return token;
    },
    signIn: async ({ user, account }) => {
      await dbConnect();

      if (account.provider === "github") {
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          AuthUser = existingUser;
          return existingUser;
        }

        const randomPassword = crypto.randomBytes(8).toString("hex");

        const hashedPassword = await hash(randomPassword, 12);

        const newUser = await User.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          image: user.image,
        });

        AuthUser = newUser;
        return newUser;
      } else {
        return true;
      }
    },
    // If we want to access our extra user info from sessions we have to pass it the token here to get them in sync:
    session: async ({ session }) => {
      if (AuthUser) {
        // Add custom data to the session object
        session.userData = {
          isAdmin: AuthUser.isAdmin,
          id: AuthUser._id,
        };
      }
      return session;
    },
  },
  pages: {
    // Here you can define your own custom pages for login, recover password, etc.
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const authHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;
