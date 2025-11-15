import {
  confirmResetPassword as amplifyConfirmResetPassword,
  resetPassword as amplifyResetPassword,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  autoSignIn,
  fetchUserAttributes,
  getCurrentUser,
} from "aws-amplify/auth";

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  name?: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

class AuthService {
  // Sign up with auto sign-in enabled
  async signUp({ email, password, name }: SignUpParams) {
    try {
      console.log("🔐 Starting sign up for:", email);

      const { isSignUpComplete, userId, nextStep } = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
          autoSignIn: true, // Enable auto sign-in
        },
      });

      console.log("✅ Sign up response:", {
        isSignUpComplete,
        userId,
        nextStep: nextStep.signUpStep,
      });

      // DISABLED: Email confirmation step
      // if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
      //   console.log("📧 Email confirmation required");
      //   return { isSignUpComplete, userId, nextStep };
      // }

      // If sign up is complete, auto sign in
      if (isSignUpComplete) {
        console.log("🎉 Sign up complete, attempting auto sign-in...");
        try {
          const signInResult = await autoSignIn();
          console.log("✅ Auto sign-in successful:", signInResult);
          return { isSignUpComplete: true, userId, nextStep, signInResult };
        } catch (autoSignInError: any) {
          console.error("⚠️ Auto sign-in failed:", {
            name: autoSignInError?.name,
            message: autoSignInError?.message,
            code: autoSignInError?.code,
          });
          // If auto sign-in fails, user will need to manually sign in
          return { isSignUpComplete, userId, nextStep };
        }
      }

      return { isSignUpComplete, userId, nextStep };
    } catch (error: any) {
      console.error("❌ Sign up error:", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        error: error,
      });
      throw this.handleAuthError(error);
    }
  }

  // DISABLED: Confirm sign up (keeping code for future use)
  // async confirmSignUp(email: string, code: string) {
  //   try {
  //     console.log("🔐 Confirming sign up for:", email);
  //     const { isSignUpComplete, nextStep } = await amplifyConfirmSignUp({
  //       username: email,
  //       confirmationCode: code,
  //     });
  //
  //     console.log("✅ Confirmation response:", { isSignUpComplete, nextStep });
  //     return { isSignUpComplete, nextStep };
  //   } catch (error: any) {
  //     console.error("❌ Confirmation error:", error);
  //     throw this.handleAuthError(error);
  //   }
  // }

  // DISABLED: Resend confirmation code (keeping code for future use)
  // async resendSignUpCode(email: string) {
  //   try {
  //     console.log("📧 Resending confirmation code to:", email);
  //     await amplifyResendSignUpCode({ username: email });
  //     console.log("✅ Confirmation code resent");
  //   } catch (error: any) {
  //     console.error("❌ Resend code error:", error);
  //     throw this.handleAuthError(error);
  //   }
  // }

  async signIn({ email, password }: SignInParams) {
    try {
      console.log("🔐 Starting sign in for:", email);
      console.log("📝 Sign in attempt details:", {
        email,
        passwordLength: password?.length,
      });

      const result = await amplifySignIn({
        username: email,
        password,
      });

      console.log("✅ Sign in raw response:", JSON.stringify(result, null, 2));

      const { isSignedIn, nextStep } = result;

      console.log("✅ Sign in parsed:", {
        isSignedIn,
        nextStep: nextStep?.signInStep,
      });

      // Check for additional steps required
      if (nextStep && nextStep.signInStep !== "DONE") {
        console.log("⚠️ Additional step required:", nextStep.signInStep);

        // Handle email confirmation required
        if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
          throw new Error(
            "Please verify your email address. Check your inbox for the confirmation code."
          );
        }

        // Handle MFA or other challenges
        if (
          nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
        ) {
          throw new Error("Password change required. Please contact support.");
        }

        throw new Error(
          `Sign in requires additional step: ${nextStep.signInStep}`
        );
      }

      if (!isSignedIn) {
        throw new Error("Sign in was not completed successfully");
      }

      console.log("✅ Sign in successful");
      return { isSignedIn, nextStep };
    } catch (error: any) {
      console.error("❌ Sign in error - Full details:", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        underlyingError: error?.underlyingError,
        $metadata: error?.$metadata,
        recoverySuggestion: error?.recoverySuggestion,
        errorString: String(error),
        errorObject: error,
      });

      // Check if this is an Amplify error
      if (error?.name || error?.message) {
        throw this.handleAuthError(error);
      }

      // If we got here, it's truly unknown
      throw new Error(
        "Unable to sign in. Please check your credentials and try again."
      );
    }
  }

  async signOut() {
    try {
      console.log("🔐 Signing out...");
      await amplifySignOut();
      console.log("✅ Sign out successful");
    } catch (error: any) {
      console.error("❌ Sign out error:", error);
      throw this.handleAuthError(error);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log("🔐 Getting current user...");
      const user = await getCurrentUser();
      console.log("✅ Current user:", user);

      const attributes = await fetchUserAttributes();
      console.log("✅ User attributes:", attributes);

      return {
        userId: user.userId,
        username: user.username,
        email: attributes.email || "",
        name: attributes.name,
      };
    } catch (error: any) {
      console.log("ℹ️ No current user:", error.message);
      return null;
    }
  }

  async resetPassword(email: string) {
    try {
      console.log("🔐 Initiating password reset for:", email);
      const output = await amplifyResetPassword({ username: email });
      console.log("✅ Password reset initiated:", output);
      return output;
    } catch (error: any) {
      console.error("❌ Reset password error:", error);
      throw this.handleAuthError(error);
    }
  }

  async confirmResetPassword(
    email: string,
    confirmationCode: string,
    newPassword: string
  ) {
    try {
      console.log("🔐 Confirming password reset for:", email);
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode,
        newPassword,
      });
      console.log("✅ Password reset confirmed");
    } catch (error: any) {
      console.error("❌ Confirm reset password error:", error);
      throw this.handleAuthError(error);
    }
  }

  private handleAuthError(error: any): Error {
    console.error("🔍 Handling auth error:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      hasError: !!error,
      errorType: typeof error,
    });

    // Handle null/undefined errors
    if (!error) {
      return new Error("An unexpected error occurred");
    }

    // Map common Amplify errors to user-friendly messages
    const errorMap: { [key: string]: string } = {
      UserNotFoundException: "No account found with this email address",
      NotAuthorizedException: "Incorrect email or password",
      UserNotConfirmedException:
        "Please verify your email address before signing in",
      UsernameExistsException: "An account with this email already exists",
      InvalidPasswordException: "Password does not meet requirements",
      CodeMismatchException: "Invalid verification code",
      ExpiredCodeException: "Verification code has expired",
      LimitExceededException: "Too many attempts. Please try again later",
      InvalidParameterException: "Invalid input. Please check your information",
      NetworkError: "Network error. Please check your connection",
      ResourceNotFoundException: "Authentication service not available",
      UserLambdaValidationException: "User validation failed",
    };

    // Get the error name
    const errorName = error?.name || error?.code || "Unknown";

    // Check if we have a mapped message
    if (errorMap[errorName]) {
      return new Error(errorMap[errorName]);
    }

    // If error has a message, use it
    if (error?.message && error.message !== "An unknown error has occurred.") {
      return new Error(error.message);
    }

    // Check for underlying error
    if (error?.underlyingError?.message) {
      return new Error(error.underlyingError.message);
    }

    // Last resort
    return new Error(
      "Unable to complete authentication. Please check your credentials and try again."
    );
  }
}

export const authService = new AuthService();
