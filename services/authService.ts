import {
  confirmResetPassword as amplifyConfirmResetPassword,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser as amplifyGetCurrentUser,
  resendSignUpCode as amplifyResendSignUpCode,
  resetPassword as amplifyResetPassword,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  updateUserAttributes as amplifyUpdateUserAttributes,
  fetchAuthSession,
  type ConfirmSignUpOutput,
  type ResetPasswordOutput,
  type SignInOutput,
  type SignUpOutput,
} from "aws-amplify/auth";

export interface AuthUser {
  userId: string;
  username: string;
  email?: string;
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
  /**
   * Register a new user
   */
  async signUp({ email, password, name }: SignUpParams): Promise<SignUpOutput> {
    try {
      const response = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });

      console.log("Sign up successful:", response);
      return response;
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Confirm user registration with verification code
   */
  async confirmSignUp(
    email: string,
    code: string
  ): Promise<ConfirmSignUpOutput> {
    try {
      const response = await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code,
      });

      console.log("Confirmation successful:", response);
      return response;
    } catch (error: any) {
      console.error("Confirmation error:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Resend confirmation code
   */
  async resendSignUpCode(email: string): Promise<void> {
    try {
      await amplifyResendSignUpCode({
        username: email,
      });
      console.log("Verification code resent successfully");
    } catch (error: any) {
      console.error("Resend code error:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in user
   */
  async signIn({ email, password }: SignInParams): Promise<SignInOutput> {
    try {
      const response = await amplifySignIn({
        username: email,
        password,
      });

      console.log("Sign in successful:", response);
      return response;
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await amplifySignOut();
      console.log("Sign out successful");
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Initiate password reset
   */
  async resetPassword(email: string): Promise<ResetPasswordOutput> {
    try {
      const response = await amplifyResetPassword({
        username: email,
      });

      console.log("Password reset initiated:", response);
      return response;
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Confirm password reset with code
   */
  async confirmResetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    try {
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });

      console.log("Password reset confirmed successfully");
    } catch (error: any) {
      console.error("Confirm reset password error:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await amplifyGetCurrentUser();
      const session = await fetchAuthSession();

      return {
        userId: user.userId,
        username: user.username,
        email: user.signInDetails?.loginId,
      };
    } catch (error: any) {
      if (error.name === "UserUnAuthenticatedException") {
        return null;
      }
      console.error("Get current user error:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user attributes
   */
  async updateUserAttributes(attributes: {
    name?: string;
    phone_number?: string;
  }): Promise<void> {
    try {
      const result = await amplifyUpdateUserAttributes({
        userAttributes: attributes,
      });

      console.log("User attributes updated:", result);
    } catch (error: any) {
      console.error("Update user attributes error:", error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await amplifyGetCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle and format auth errors
   */
  private handleAuthError(error: any): Error {
    const errorMessage = this.getErrorMessage(error);
    return new Error(errorMessage);
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(error: any): string {
    const errorCode = error.name || error.code;

    const errorMessages: Record<string, string> = {
      // Sign Up Errors
      UsernameExistsException: "An account with this email already exists.",
      InvalidPasswordException:
        "Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.",
      InvalidParameterException: "Please check your input and try again.",

      // Sign In Errors
      UserNotFoundException: "No account found with this email.",
      NotAuthorizedException: "Incorrect email or password.",
      UserNotConfirmedException: "Please verify your email address first.",
      PasswordResetRequiredException: "Password reset is required.",

      // Confirmation Errors
      CodeMismatchException: "Invalid verification code. Please try again.",
      ExpiredCodeException:
        "Verification code has expired. Please request a new one.",
      LimitExceededException: "Too many attempts. Please try again later.",

      // Network Errors
      NetworkError: "Network error. Please check your connection.",

      // Password Reset Errors
      LimitExceededException: "Too many requests. Please try again later.",
      InvalidParameterException: "Invalid parameters provided.",
    };

    return (
      errorMessages[errorCode] ||
      error.message ||
      "An unexpected error occurred."
    );
  }
}

export const authService = new AuthService();
